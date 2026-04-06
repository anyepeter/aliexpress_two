import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MarketplaceProduct, StoreInfo } from "@/lib/types/marketplace";
import type { Prisma } from "@prisma/client";

// GET /api/products/marketplace?category=&search=&sort=&minPrice=&maxPrice=&verifiedOnly=&page=1&limit=20&exclude=
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const limit = Math.min(parseInt(sp.get("limit") ?? "20"), 100);
  const page = Math.max(parseInt(sp.get("page") ?? "1"), 1);
  const skip = (page - 1) * limit;
  const category = sp.get("category") || null;
  const search = sp.get("search") || null;
  const sort = sp.get("sort") || "relevance";
  const minPrice = parseFloat(sp.get("minPrice") ?? "0");
  const maxPrice = parseFloat(sp.get("maxPrice") ?? "999999");
  const verifiedOnly = sp.get("verifiedOnly") === "true";
  const exclude = sp.get("exclude") || null;

  // Build Prisma where clause
  const where: Prisma.SellerProductWhereInput = {
    status: "PUBLISHED",
    store: {
      user: { status: "ACTIVE" },
      ...(verifiedOnly ? { isVerified: true } : {}),
    },
    ...(category ? { category } : {}),
    ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
    sellingPrice: { gte: minPrice, lte: maxPrice },
    ...(exclude ? { id: { not: exclude } } : {}),
  };

  // Build orderBy
  type OrderBy = Prisma.SellerProductOrderByWithRelationInput;
  let orderBy: OrderBy[] = [
    { store: { isVerified: "desc" } },
    { sortOrder: "asc" },
  ];
  if (sort === "price-asc") orderBy = [{ sellingPrice: "asc" }];
  else if (sort === "price-desc") orderBy = [{ sellingPrice: "desc" }];
  else if (sort === "newest") orderBy = [{ createdAt: "desc" }];

  const [dbProducts, total] = await Promise.all([
    prisma.sellerProduct.findMany({
      where,
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
      orderBy,
      skip,
      take: limit,
    }),
    prisma.sellerProduct.count({ where }),
  ]);

  // Batch fetch product data from local DB
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

  const validDb = enriched.filter((p): p is MarketplaceProduct => p !== null);
  const hasMore = skip + limit < total;

  // Fill with local DB fallback if not enough seller products
  let products: MarketplaceProduct[] = validDb;
  if (validDb.length < limit && !verifiedOnly && !search) {
    const usedIds = new Set(dbProducts.map((p) => p.dummyProductId));
    if (exclude?.startsWith("dummy-")) {
      usedIds.add(parseInt(exclude.replace("dummy-", ""), 10));
    }

    const extraWhere: Prisma.ProductWhereInput = {
      id: { notIn: Array.from(usedIds) },
      ...(category ? { category } : {}),
    };

    const extra = await prisma.product.findMany({
      where: extraWhere,
      take: limit - validDb.length,
      orderBy: { id: "asc" },
    });

    const fallback = extra.map((p): MarketplaceProduct => ({
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
    products = [...validDb, ...fallback];
  }

  return NextResponse.json({ products, total, hasMore });
}
