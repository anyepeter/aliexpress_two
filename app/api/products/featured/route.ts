import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MarketplaceProduct, StoreInfo } from "@/lib/types/marketplace";

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

async function fetchDummy(dummyProductId: number): Promise<DummyProduct | null> {
  try {
    const r = await fetch(`https://dummyjson.com/products/${dummyProductId}`, {
      next: { revalidate: 3600 },
    });
    return r.ok ? (r.json() as Promise<DummyProduct>) : null;
  } catch {
    return null;
  }
}

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

async function fetchHotProducts(needed: number): Promise<DummyProduct[]> {
  try {
    const fetches = HOT_CATEGORIES.map((cat) =>
      fetch(`https://dummyjson.com/products/category/${cat}?limit=5`, {
        next: { revalidate: 3600 },
      })
        .then((r) => (r.ok ? r.json() : { products: [] }))
        .then((d: { products: DummyProduct[] }) => d.products)
        .catch(() => [] as DummyProduct[])
    );
    const all = (await Promise.all(fetches)).flat();
    // Shuffle for variety
    return all.sort(() => Math.random() - 0.5).slice(0, needed);
  } catch {
    return [];
  }
}

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

  // ── 2. Enrich each DB product with DummyJSON data ──────────────────────────
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
        sellingPrice: p.sellingPrice,  // NEVER expose basePrice/marginPercent
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

  const validDbProducts = enriched.filter((p): p is MarketplaceProduct => p !== null);

  // ── 3. Paginate DB results ─────────────────────────────────────────────────
  const paginatedDb = validDbProducts.slice(skip, skip + limit);
  let products: MarketplaceProduct[] = paginatedDb;

  // ── 4. Fill remaining slots with DummyJSON fallback if needed ──────────────
  const usedDummyIds = new Set(dbProducts.map((p) => p.dummyProductId));
  const remaining = limit - paginatedDb.length;

  if (remaining > 0 && !verifiedOnly) {
    const fallbackRaw = await fetchHotProducts(remaining + usedDummyIds.size);
    const fallback = fallbackRaw
      .filter((p) => !usedDummyIds.has(p.id))
      .slice(0, remaining)
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
    products = [...paginatedDb, ...fallback];
  }

  const total = validDbProducts.length;
  const hasMore = skip + limit < total || (!verifiedOnly && products.length === limit);

  return NextResponse.json({ products, hasMore, total });
}
