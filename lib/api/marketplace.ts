import { prisma } from "@/lib/prisma";
import type { MarketplaceProduct } from "@/lib/types/marketplace";

/**
 * Fetch ALL marketplace products for the shop page (server-side).
 * Merges DB seller products (enriched with local Product table) + remaining products.
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

    // 2. Batch fetch product data from local Product table
    const dummyIds = sellerProducts.map((p) => p.dummyProductId);
    const productRecords = await prisma.product.findMany({
      where: { id: { in: dummyIds } },
    });
    const productMap = new Map(productRecords.map((p) => [p.id, p]));

    const enriched = sellerProducts.map((p) => {
      const prodData = productMap.get(p.dummyProductId);
      if (!prodData) return null;
      return {
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
        store: {
          id: p.store.id,
          userId: p.store.userId,
          storeName: p.store.storeName,
          storeSlug: p.store.storeSlug,
          logoUrl: p.store.logoUrl,
          bannerUrl: p.store.bannerUrl,
          description: p.store.description,
          isVerified: p.store.isVerified,
          createdAt: p.store.createdAt.toISOString(),
          ownerEmail: null,
          ownerPhone: null,
          country: p.store.country ?? null,
          city: p.store.city ?? null,
          socialLinks: (p.store.socialLinks as Record<string, string>) ?? null,
        },
        isPremium: p.store.isVerified,
      } as MarketplaceProduct;
    });

    const dbProducts = enriched.filter(
      (p): p is MarketplaceProduct => p !== null
    );
    const usedDummyIds = new Set(dbProducts.map((p) => p.dummyProductId));

    // 3. Get remaining products from local Product table
    const allProducts = await prisma.product.findMany({
      where: { id: { notIn: Array.from(usedDummyIds) } },
      orderBy: { id: "asc" },
    });

    const fallbacks: MarketplaceProduct[] = allProducts.map((p) => ({
      id: `dummy-${p.id}`,
      dummyProductId: p.id,
      title: p.title,
      thumbnail: p.thumbnail ?? "",
      images: p.images ?? [],
      brand: p.brand ?? "Unknown",
      category: p.category,
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

    return [...dbProducts, ...fallbacks];
  } catch (error) {
    console.error("getAllMarketplaceProducts error:", error);
    return [];
  }
}
