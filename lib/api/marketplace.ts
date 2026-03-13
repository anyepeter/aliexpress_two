import { prisma } from "@/lib/prisma";
import type { MarketplaceProduct } from "@/lib/types/marketplace";

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

/**
 * Fetch ALL marketplace products for the shop page (server-side).
 * Merges DB seller products (enriched with DummyJSON) + remaining DummyJSON products.
 */
export async function getAllMarketplaceProducts(): Promise<MarketplaceProduct[]> {
  try {
    // 1. Get all published seller products from DB
    const sellerProducts = await prisma.sellerProduct.findMany({
      where: {
        status: "PUBLISHED",
        store: { user: { status: "ACTIVE" } },
      },
      include: { store: true },
      orderBy: [{ store: { isVerified: "desc" } }, { sortOrder: "asc" }],
    });

    // 2. Enrich DB products with DummyJSON
    const enriched = await Promise.all(
      sellerProducts.map(async (p) => {
        try {
          const r = await fetch(
            `https://dummyjson.com/products/${p.dummyProductId}`,
            { next: { revalidate: 3600 } }
          );
          if (!r.ok) return null;
          const dummy = (await r.json()) as DummyProduct;
          return {
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
            store: {
              id: p.store.id,
              storeName: p.store.storeName,
              storeSlug: p.store.storeSlug,
              logoUrl: p.store.logoUrl,
              bannerUrl: p.store.bannerUrl,
              description: p.store.description,
              isVerified: p.store.isVerified,
              createdAt: p.store.createdAt.toISOString(),
            },
            isPremium: p.store.isVerified,
          } as MarketplaceProduct;
        } catch {
          return null;
        }
      })
    );

    const dbProducts = enriched.filter(
      (p): p is MarketplaceProduct => p !== null
    );
    const usedDummyIds = new Set(dbProducts.map((p) => p.dummyProductId));

    // 3. Get all DummyJSON products for the remainder
    const dummyRes = await fetch(
      "https://dummyjson.com/products?limit=0",
      { next: { revalidate: 3600 } }
    );
    if (!dummyRes.ok) return dbProducts;

    const dummyData = (await dummyRes.json()) as { products: DummyProduct[] };
    const fallbacks: MarketplaceProduct[] = dummyData.products
      .filter((p) => !usedDummyIds.has(p.id))
      .map((p) => ({
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

    return [...dbProducts, ...fallbacks];
  } catch (error) {
    console.error("getAllMarketplaceProducts error:", error);
    return [];
  }
}
