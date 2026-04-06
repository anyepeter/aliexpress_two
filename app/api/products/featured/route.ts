import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MarketplaceProduct, StoreInfo } from "@/lib/types/marketplace";

const HOT_CATEGORIES = [
  "smartphones",
  "laptops",
  "tablets",
  "mens-watches",
  "womens-watches",
  "womens-bags",
  "sunglasses",
  "mens-shoes",
  "womens-shoes",
  "womens-dresses",
  "tops",
  "beauty",
  "skin-care",
  "fragrances",
  "mobile-accessories",
  "sports-accessories",
];

// GET /api/products/featured?limit=20&page=1&verifiedOnly=false
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 60);
  const page = Math.max(parseInt(searchParams.get("page") ?? "1"), 1);
  const verifiedOnly = searchParams.get("verifiedOnly") === "true";
  const skip = (page - 1) * limit;

  // ── 1. Fetch published seller products from DB ─────────────────────────────
  const dbProducts = await prisma.sellerProduct.findMany({
    where: {
      status: "PUBLISHED",
      store: {
        user: { status: "ACTIVE" },
        ...(verifiedOnly ? { isVerified: true } : {}),
      },
    },
    include: {
      store: {
        select: {
          id: true,
          userId: true,
          storeName: true,
          storeSlug: true,
          logoUrl: true,
          bannerUrl: true,
          description: true,
          isVerified: true,
          createdAt: true,
          country: true,
          city: true,
          socialLinks: true,
          averageRating: true,
          totalReviews: true,
          ratingOverride: true,
          user: { select: { email: true, phone: true } },
        },
      },
    },
    orderBy: [
      { store: { isVerified: "desc" } },
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });

  // ── 2. Batch fetch product data from local DB ──────────────────────────
  const dummyIds = dbProducts.map((p) => p.dummyProductId);
  const productRecords = await prisma.product.findMany({
    where: { id: { in: dummyIds } },
  });
  const productMap = new Map(productRecords.map((p) => [p.id, p]));

  const enriched = dbProducts.map((p) => {
    const prodData = productMap.get(p.dummyProductId);
    if (!prodData) return null;

    const storeInfo: StoreInfo = {
      id: p.store.id,
      userId: p.store.userId,
      storeName: p.store.storeName,
      storeSlug: p.store.storeSlug,
      logoUrl: p.store.logoUrl,
      bannerUrl: p.store.bannerUrl,
      description: p.store.description,
      isVerified: p.store.isVerified,
      createdAt: p.store.createdAt.toISOString(),
      ownerEmail: p.store.user?.email ?? null,
      ownerPhone: p.store.user?.phone ?? null,
      country: p.store.country ?? null,
      city: p.store.city ?? null,
      socialLinks: (p.store.socialLinks as Record<string, string>) ?? null,
      averageRating: p.store.ratingOverride ?? p.store.averageRating ?? null,
      totalReviews: p.store.totalReviews ?? 0,
      ratingOverride: p.store.ratingOverride ?? null,
    };

    const product: MarketplaceProduct = {
      id: p.id,
      dummyProductId: p.dummyProductId,
      title: p.title,
      thumbnail: prodData.thumbnail ?? "",
      images: prodData.images ?? [],
      brand: p.brand ?? prodData.brand ?? "Unknown",
      category: p.category,
      subcategory: prodData.subcategory ?? null,
      sellingPrice: p.sellingPrice,
      rating: prodData.rating ?? 0,
      discountPercentage: prodData.discountPercentage ?? 0,
      stock: prodData.stock ?? 0,
      description: p.description ?? prodData.description,
      shortDescription: prodData.shortDescription,
      keyFeatures: prodData.keyFeatures,
      store: storeInfo,
      isPremium: p.store.isVerified,
    };
    return product;
  });

  const validDbProducts = enriched.filter((p): p is MarketplaceProduct => p !== null);

  // ── 3. Paginate DB results ─────────────────────────────────────────────────
  const paginatedDb = validDbProducts.slice(skip, skip + limit);
  let products: MarketplaceProduct[] = paginatedDb;

  // ── 4. Fill remaining slots with local DB fallback products ──────────────
  const usedDummyIds = new Set(dbProducts.map((p) => p.dummyProductId));
  const remaining = limit - paginatedDb.length;

  if (remaining > 0 && !verifiedOnly) {
    const fallbackRaw = await prisma.product.findMany({
      where: {
        category: { in: HOT_CATEGORIES },
        id: { notIn: Array.from(usedDummyIds) },
      },
      take: remaining + 10,
    });

    const shuffled = fallbackRaw.sort(() => Math.random() - 0.5);
    const fallback = shuffled
      .slice(0, remaining)
      .map((p): MarketplaceProduct => ({
        id: `dummy-${p.id}`,
        dummyProductId: p.id,
        title: p.title,
        thumbnail: p.thumbnail ?? "",
        images: p.images ?? [],
        brand: p.brand ?? "Unknown",
        category: p.category,
        subcategory: p.subcategory ?? null,
        sellingPrice: p.price,
        rating: p.rating ?? 0,
        discountPercentage: p.discountPercentage ?? 0,
        stock: p.stock ?? 0,
        description: p.description,
        shortDescription: p.shortDescription,
        keyFeatures: p.keyFeatures,
        store: null,
        isPremium: false,
      }));
    products = [...paginatedDb, ...fallback];
  }

  const total = validDbProducts.length;
  const hasMore = skip + limit < total || (!verifiedOnly && products.length === limit);

  return NextResponse.json({ products, hasMore, total });
}
