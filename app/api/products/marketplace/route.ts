import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MarketplaceProduct, StoreInfo } from "@/lib/types/marketplace";
import type { Prisma } from "@prisma/client";

type DummyProduct = {
  id: number;
  title: string;
  thumbnail: string;
  images: string[];
  brand?: string;
  category: string;
  price: number;
  rating: number;
  discountPercentage: number;
  stock: number;
  description: string;
};

async function fetchDummy(id: number): Promise<DummyProduct | null> {
  try {
    const r = await fetch(`https://dummyjson.com/products/${id}`, {
      next: { revalidate: 3600 },
    });
    return r.ok ? (r.json() as Promise<DummyProduct>) : null;
  } catch {
    return null;
  }
}

async function fetchDummyList(limit: number, skip: number): Promise<DummyProduct[]> {
  try {
    const r = await fetch(
      `https://dummyjson.com/products?limit=${limit}&skip=${skip}`,
      { next: { revalidate: 3600 } }
    );
    if (!r.ok) return [];
    const data = (await r.json()) as { products: DummyProduct[] };
    return data.products ?? [];
  } catch {
    return [];
  }
}

async function fetchDummyByCategory(category: string, limit: number): Promise<DummyProduct[]> {
  try {
    const r = await fetch(
      `https://dummyjson.com/products/category/${encodeURIComponent(category)}?limit=${limit}`,
      { next: { revalidate: 3600 } }
    );
    if (!r.ok) return [];
    const data = (await r.json()) as { products: DummyProduct[] };
    return data.products ?? [];
  } catch {
    return [];
  }
}

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

  const enriched = await Promise.all(
    dbProducts.map(async (p) => {
      const dummy = await fetchDummy(p.dummyProductId);
      if (!dummy) return null;

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
      };

      const product: MarketplaceProduct = {
        id: p.id,
        dummyProductId: p.dummyProductId,
        title: p.title,
        thumbnail: dummy.thumbnail,
        images: dummy.images ?? [],
        brand: p.brand ?? dummy.brand ?? "Unknown",
        category: p.category,
        sellingPrice: p.sellingPrice,
        rating: dummy.rating,
        discountPercentage: dummy.discountPercentage,
        stock: dummy.stock,
        description: p.description ?? dummy.description,
        store: storeInfo,
        isPremium: p.store.isVerified,
      };
      return product;
    })
  );

  const validDb = enriched.filter((p): p is MarketplaceProduct => p !== null);
  const hasMore = skip + limit < total;

  // Fill with DummyJSON fallback if not enough DB products
  let products: MarketplaceProduct[] = validDb;
  if (validDb.length < limit && !verifiedOnly && !search) {
    const usedIds = new Set(dbProducts.map((p) => p.dummyProductId));
    if (exclude?.startsWith("dummy-")) {
      usedIds.add(parseInt(exclude.replace("dummy-", ""), 10));
    }

    // If category filter is active, fetch DummyJSON by category; otherwise general list
    const extra = category
      ? await fetchDummyByCategory(category, limit - validDb.length + 10)
      : await fetchDummyList(limit - validDb.length + 10, 0);

    const fallback = extra
      .filter((p) => !usedIds.has(p.id))
      .slice(0, limit - validDb.length)
      .map((p): MarketplaceProduct => ({
        id: `dummy-${p.id}`,
        dummyProductId: p.id,
        title: p.title,
        thumbnail: p.thumbnail,
        images: p.images ?? [],
        brand: p.brand ?? "Unknown",
        category: p.category,
        sellingPrice: p.price,
        rating: p.rating,
        discountPercentage: p.discountPercentage,
        stock: p.stock,
        description: p.description,
        store: null,
        isPremium: false,
      }));
    products = [...validDb, ...fallback];
  }

  return NextResponse.json({ products, total, hasMore });
}
