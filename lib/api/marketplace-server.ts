import { prisma } from "@/lib/prisma";
import type { MarketplaceProduct, StoreInfo } from "@/lib/types/marketplace";
import type { Product } from "@prisma/client";

/** Fetch product data from our local NeonDB Product table (replaces DummyJSON API). */
async function fetchProductData(id: number): Promise<Product | null> {
  try {
    return await prisma.product.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

/** Fetch multiple products by IDs from local DB. */
async function fetchProductsByIds(ids: number[]): Promise<Map<number, Product>> {
  try {
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
    });
    return new Map(products.map((p) => [p.id, p]));
  } catch {
    return new Map();
  }
}

/**
 * Server-side: fetch featured marketplace products (DB seller products first,
 * filled with DummyJSON fallback if needed). Safe to call from Server Components.
 */
export async function getFeaturedMarketplaceProducts(
  limit = 20
): Promise<MarketplaceProduct[]> {
  try {
    const sellerProducts = await prisma.sellerProduct.findMany({
      where: {
        status: "PUBLISHED",
        store: { user: { status: "ACTIVE" } },
      },
      include: { store: { include: { user: { select: { email: true, phone: true } } } } },
      orderBy: [{ store: { isVerified: "desc" } }, { sortOrder: "asc" }],
      take: limit,
    });

    // Batch fetch all product data from local DB
    const dummyIds = sellerProducts.map((p) => p.dummyProductId);
    const productDataMap = await fetchProductsByIds(dummyIds);

    const enriched = sellerProducts.map((p) => {
      const prodData = productDataMap.get(p.dummyProductId);
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
        store: storeInfo,
        isPremium: p.store.isVerified,
      } as MarketplaceProduct;
    });

    const dbProducts = enriched.filter(
      (p): p is MarketplaceProduct => p !== null
    );

    if (dbProducts.length >= limit) return dbProducts;

    // Fill remaining slots from local Product table (high-converting categories)
    const usedIds = new Set(dbProducts.map((p) => p.dummyProductId));
    const needed = limit - dbProducts.length;

    const hotCategories = [
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

    const fallbackProducts = await prisma.product.findMany({
      where: {
        category: { in: hotCategories },
        id: { notIn: Array.from(usedIds) },
      },
      take: needed + 10,
    });

    // Shuffle for variety
    const shuffled = fallbackProducts.sort(() => Math.random() - 0.5);

    const fallbacks: MarketplaceProduct[] = shuffled
      .slice(0, needed)
      .map((p) => ({
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
    console.error("getFeaturedMarketplaceProducts error:", error);
    return [];
  }
}

/**
 * Server-side: fetch flash-deal products from a seller store.
 * Prefers verified stores, falls back to any active store with products.
 * Returns their products + store info so "View All" can link to the store.
 */
export async function getFlashDealProducts(limit = 10): Promise<{
  products: MarketplaceProduct[];
  store: StoreInfo | null;
}> {
  try {
    // Try verified first, then fall back to any active store with products
    let store = await prisma.store.findFirst({
      where: {
        isVerified: true,
        user: { status: "ACTIVE" },
        sellerProducts: { some: { status: "PUBLISHED" } },
      },
      include: { user: { select: { email: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    });

    if (!store) {
      store = await prisma.store.findFirst({
        where: {
          user: { status: "ACTIVE" },
          sellerProducts: { some: { status: "PUBLISHED" } },
        },
        include: { user: { select: { email: true, phone: true } } },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!store) return { products: [], store: null };

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
      averageRating: store.ratingOverride ?? store.averageRating ?? null,
      totalReviews: store.totalReviews ?? 0,
      ratingOverride: store.ratingOverride ?? null,
    };

    const sellerProducts = await prisma.sellerProduct.findMany({
      where: { storeId: store.id, status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
      take: limit,
    });

    // Batch fetch product data from local DB
    const flashDummyIds = sellerProducts.map((p) => p.dummyProductId);
    const flashProductMap = await fetchProductsByIds(flashDummyIds);

    const enriched = sellerProducts.map((p) => {
      const prodData = flashProductMap.get(p.dummyProductId);
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
        store: storeInfo,
        isPremium: store.isVerified,
      } as MarketplaceProduct;
    });

    return {
      products: enriched.filter((p): p is MarketplaceProduct => p !== null),
      store: storeInfo,
    };
  } catch (error) {
    console.error("getFlashDealProducts error:", error);
    return { products: [], store: null };
  }
}

/**
 * Server-side: fetch Today's Deals sections (Dollar Express + SuperDeals).
 * Returns admin-configured products from DealSection tables, or null if not set up.
 */
type DealProductData = {
  id: string;
  dummyProductId: number;
  title: string;
  thumbnail: string;
  price: number;
  oldPrice: number | null;
  discountPercentage: number;
  badge: string | null;
  href: string;
  brand: string;
  category: string;
  description: string;
  stock: number;
  rating: number;
  images: string[];
};

export async function getTodaysDeals(): Promise<{
  dollarExpress: { title: string; subtitle: string | null; products: DealProductData[] } | null;
  superDeals: { title: string; subtitle: string | null; products: DealProductData[] } | null;
}> {
  try {
    const sections = await prisma.dealSection.findMany({
      where: { isActive: true },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
      },
    });

    type DealResult = {
      title: string;
      subtitle: string | null;
      products: DealProductData[];
    } | null;

    const result: { dollarExpress: DealResult; superDeals: DealResult } = {
      dollarExpress: null,
      superDeals: null,
    };

    for (const section of sections) {
      // Batch fetch product data from local DB
      const dealDummyIds = section.items.map((item) => item.dummyProductId);
      const dealProductMap = await fetchProductsByIds(dealDummyIds);

      const products = section.items.map((item) => {
        const prodData = dealProductMap.get(item.dummyProductId);
        return {
          id: item.id,
          dummyProductId: item.dummyProductId,
          title: item.customTitle ?? prodData?.title ?? "Product",
          thumbnail: prodData?.thumbnail ?? "",
          price: item.customPrice ?? prodData?.price ?? 0,
          oldPrice: item.customOldPrice ?? null,
          discountPercentage: prodData?.discountPercentage ?? 0,
          badge: item.customBadge ?? null,
          href: item.productId ? `/products/${item.productId}` : `/products/dummy-${item.dummyProductId}`,
          brand: prodData?.brand ?? "Unknown",
          category: prodData?.category ?? "general",
          description: prodData?.description ?? "",
          stock: prodData?.stock ?? 100,
          rating: prodData?.rating ?? 4.0,
          images: prodData?.images ?? [],
        };
      });

      const sectionData = {
        title: section.title,
        subtitle: section.subtitle,
        products,
      };

      if (section.type === "DOLLAR_EXPRESS") result.dollarExpress = sectionData;
      else result.superDeals = sectionData;
    }

    return result;
  } catch (error) {
    console.error("getTodaysDeals error:", error);
    return { dollarExpress: null, superDeals: null };
  }
}

/**
 * Server-side: fetch ALL active stores for the /stores listing page.
 * Verified stores appear first.
 */
export async function getAllStores(): Promise<
  (StoreInfo & { productCount: number })[]
> {
  try {
    const stores = await prisma.store.findMany({
      where: { user: { status: "ACTIVE" } },
      include: {
        user: { select: { email: true, phone: true } },
        _count: { select: { sellerProducts: { where: { status: "PUBLISHED" } } } },
      },
      orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
    });
    return stores.map((s) => ({
      id: s.id,
      userId: s.userId,
      storeName: s.storeName,
      storeSlug: s.storeSlug,
      logoUrl: s.logoUrl,
      bannerUrl: s.bannerUrl,
      description: s.description,
      isVerified: s.isVerified,
      createdAt: s.createdAt.toISOString(),
      ownerEmail: s.user?.email ?? null,
      ownerPhone: s.user?.phone ?? null,
      country: s.country ?? null,
      city: s.city ?? null,
      socialLinks: (s.socialLinks as Record<string, string>) ?? null,
      averageRating: s.ratingOverride ?? s.averageRating ?? null,
      totalReviews: s.totalReviews ?? 0,
      ratingOverride: s.ratingOverride ?? null,
      productCount: s._count.sellerProducts,
    }));
  } catch (error) {
    console.error("getAllStores error:", error);
    return [];
  }
}

/**
 * Server-side: fetch premium sellers for the PremiumSellerStrip.
 * Only stores marked as isPremium by admin are shown, ordered by premiumOrder.
 */
export async function getVerifiedStores(limit = 10): Promise<StoreInfo[]> {
  try {
    const stores = await prisma.store.findMany({
      where: { isPremium: true, user: { status: "ACTIVE" } },
      include: { user: { select: { email: true, phone: true } } },
      orderBy: { premiumOrder: "asc" },
      take: limit,
    });
    return stores.map((s) => ({
      id: s.id,
      userId: s.userId,
      storeName: s.storeName,
      storeSlug: s.storeSlug,
      logoUrl: s.logoUrl,
      bannerUrl: s.bannerUrl,
      description: s.description,
      isVerified: s.isVerified,
      createdAt: s.createdAt.toISOString(),
      ownerEmail: s.user?.email ?? null,
      ownerPhone: s.user?.phone ?? null,
      country: s.country ?? null,
      city: s.city ?? null,
      socialLinks: (s.socialLinks as Record<string, string>) ?? null,
      averageRating: s.ratingOverride ?? s.averageRating ?? null,
      totalReviews: s.totalReviews ?? 0,
      ratingOverride: s.ratingOverride ?? null,
    }));
  } catch (error) {
    console.error("getVerifiedStores error:", error);
    return [];
  }
}
