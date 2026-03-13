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

    const enriched = await Promise.all(
      sellerProducts.map(async (p) => {
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
          store: storeInfo,
          isPremium: p.store.isVerified,
        } as MarketplaceProduct;
      })
    );

    const dbProducts = enriched.filter(
      (p): p is MarketplaceProduct => p !== null
    );

    if (dbProducts.length >= limit) return dbProducts;

    // Fill remaining slots with high-converting DummyJSON categories
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

    const categoryFetches = hotCategories.map((cat) =>
      fetch(`https://dummyjson.com/products/category/${cat}?limit=5`, {
        next: { revalidate: 3600 },
      })
        .then((r) => (r.ok ? r.json() : { products: [] }))
        .then((d: { products: DummyProduct[] }) => d.products)
        .catch(() => [] as DummyProduct[])
    );

    const allCategoryProducts = (await Promise.all(categoryFetches)).flat();

    // Shuffle for variety, filter used IDs, pick what we need
    const shuffled = allCategoryProducts
      .filter((p) => !usedIds.has(p.id))
      .sort(() => Math.random() - 0.5);

    const fallbacks: MarketplaceProduct[] = shuffled
      .slice(0, needed)
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
    };

    const sellerProducts = await prisma.sellerProduct.findMany({
      where: { storeId: store.id, status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
      take: limit,
    });

    const enriched = await Promise.all(
      sellerProducts.map(async (p) => {
        const dummy = await fetchDummy(p.dummyProductId);
        if (!dummy) return null;
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
          store: storeInfo,
          isPremium: store.isVerified,
        } as MarketplaceProduct;
      })
    );

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
      const products = await Promise.all(
        section.items.map(async (item) => {
          const dummy = await fetchDummy(item.dummyProductId);
          return {
            id: item.id,
            dummyProductId: item.dummyProductId,
            title: item.customTitle ?? dummy?.title ?? "Product",
            thumbnail: dummy?.thumbnail ?? "",
            price: item.customPrice ?? dummy?.price ?? 0,
            oldPrice: item.customOldPrice ?? null,
            discountPercentage: dummy?.discountPercentage ?? 0,
            badge: item.customBadge ?? null,
            href: item.productId ? `/products/${item.productId}` : `/products/dummy-${item.dummyProductId}`,
            brand: dummy?.brand ?? "Unknown",
            category: dummy?.category ?? "general",
            description: dummy?.description ?? "",
            stock: dummy?.stock ?? 100,
            rating: dummy?.rating ?? 4.0,
            images: dummy?.images ?? [],
          };
        })
      );

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
    }));
  } catch (error) {
    console.error("getVerifiedStores error:", error);
    return [];
  }
}
