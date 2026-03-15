import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MarketplaceProduct, StoreInfo } from "@/lib/types/marketplace";
import type { Prisma } from "@prisma/client";

// GET /api/store/[storeSlug]/products?category=&sort=&page=1&limit=12&exclude=
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeSlug: string }> }
) {
  const { storeSlug } = await params;
  const sp = new URL(req.url).searchParams;
  const limit = Math.min(parseInt(sp.get("limit") ?? "12"), 60);
  const page = Math.max(parseInt(sp.get("page") ?? "1"), 1);
  const skip = (page - 1) * limit;
  const category = sp.get("category") || null;
  const sort = sp.get("sort") || "relevance";
  const exclude = sp.get("exclude") || null;

  // Find store (public access)
  const store = await prisma.store.findUnique({
    where: { storeSlug },
    include: { user: { select: { status: true, email: true, phone: true } } },
  });

  if (!store || store.user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Build where clause
  const where: Prisma.SellerProductWhereInput = {
    storeId: store.id,
    status: "PUBLISHED",
    ...(category ? { category } : {}),
    ...(exclude ? { id: { not: exclude } } : {}),
  };

  // Build orderBy
  type OrderBy = Prisma.SellerProductOrderByWithRelationInput;
  let orderBy: OrderBy[] = [{ sortOrder: "asc" }];
  if (sort === "price-asc") orderBy = [{ sellingPrice: "asc" }];
  else if (sort === "price-desc") orderBy = [{ sellingPrice: "desc" }];
  else if (sort === "newest") orderBy = [{ createdAt: "desc" }];

  const [sellerProducts, total] = await Promise.all([
    prisma.sellerProduct.findMany({ where, orderBy, skip, take: limit }),
    prisma.sellerProduct.count({ where }),
  ]);

  // Get unique categories across ALL published products in this store
  const allPublished = await prisma.sellerProduct.findMany({
    where: { storeId: store.id, status: "PUBLISHED" },
    select: { category: true },
  });
  const categories = [...new Set(allPublished.map((p) => p.category))].sort();

  // Batch fetch product data from local DB
  const dummyIds = sellerProducts.map((p) => p.dummyProductId);
  const productRecords = await prisma.product.findMany({
    where: { id: { in: dummyIds } },
  });
  const productMap = new Map(productRecords.map((p) => [p.id, p]));

  const enriched = sellerProducts.map((p) => {
    const prodData = productMap.get(p.dummyProductId);
    if (!prodData) return null;

    const storeInfo: StoreInfo = {
      id: store.id,
      userId: store.userId,
      storeName: store.storeName,
      storeSlug: store.storeSlug,
      logoUrl: store.logoUrl,
      bannerUrl: store.bannerUrl,
      description: store.description,
      isVerified: store.isVerified,
      createdAt: store.createdAt.toISOString(),
      ownerEmail: store.user?.email ?? null,
      ownerPhone: store.user?.phone ?? null,
      country: store.country ?? null,
      city: store.city ?? null,
      socialLinks: (store.socialLinks as Record<string, string>) ?? null,
    };

    const product: MarketplaceProduct = {
      id: p.id,
      dummyProductId: p.dummyProductId,
      title: p.title,
      thumbnail: prodData.thumbnail ?? "",
      images: prodData.images ?? [],
      brand: p.brand ?? prodData.brand ?? "Unknown",
      category: p.category,
      sellingPrice: p.sellingPrice,
      rating: prodData.rating ?? 0,
      discountPercentage: prodData.discountPercentage ?? 0,
      stock: prodData.stock ?? 0,
      description: p.description ?? prodData.description,
      shortDescription: prodData.shortDescription,
      keyFeatures: prodData.keyFeatures,
      store: storeInfo,
      isPremium: store.isVerified,
    };
    return product;
  });

  const products = enriched.filter((p): p is MarketplaceProduct => p !== null);
  const hasMore = skip + limit < total;

  const storeInfo: StoreInfo = {
    id: store.id,
    userId: store.userId,
    storeName: store.storeName,
    storeSlug: store.storeSlug,
    logoUrl: store.logoUrl,
    bannerUrl: store.bannerUrl,
    description: store.description,
    isVerified: store.isVerified,
    createdAt: store.createdAt.toISOString(),
    ownerEmail: store.user?.email ?? null,
    ownerPhone: store.user?.phone ?? null,
    country: store.country ?? null,
    city: store.city ?? null,
    socialLinks: (store.socialLinks as Record<string, string>) ?? null,
  };

  return NextResponse.json({ store: storeInfo, products, total, hasMore, categories });
}
