import type { MarketplaceProduct } from "@/lib/types/marketplace";
import type { ShopFilters } from "@/lib/store/shopStore";

export function getEffectivePrice(product: MarketplaceProduct): number {
  return product.discountPercentage > 0
    ? product.sellingPrice * (1 - product.discountPercentage / 100)
    : product.sellingPrice;
}

export interface ShopResult {
  products: MarketplaceProduct[];
  total: number;
  brands: string[];
  brandCounts: Record<string, number>;
  priceRange: { min: number; max: number };
  categoryCounts: Record<string, number>;
  subcategoryCounts: Record<string, number>;
}

export function filterAndSortProducts(
  allProducts: MarketplaceProduct[],
  filters: ShopFilters,
  sortBy: string,
  page: number,
  limit: number
): ShopResult {
  // ── Filter ──────────────────────────────────────────────────────────────
  const filtered = allProducts.filter((p) => {
    // Category (compare lowercase slug)
    if (filters.category) {
      const cat = p.category.toLowerCase();
      const filterCat = filters.category.toLowerCase();
      if (cat !== filterCat) return false;
    }

    // Subcategory
    if (filters.subcategory) {
      const sub = (p.subcategory ?? "").toLowerCase();
      const filterSub = filters.subcategory.toLowerCase();
      if (sub !== filterSub) return false;
    }

    // Price range
    const price = getEffectivePrice(p);
    if (filters.minPrice > 0 && price < filters.minPrice) return false;
    if (filters.maxPrice < 10000 && price > filters.maxPrice) return false;

    // Rating
    if (filters.minRating > 0 && p.rating < filters.minRating) return false;

    // Search
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matches =
        p.title.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // Stock
    if (filters.inStockOnly && p.stock === 0) return false;

    // Brands
    if (
      filters.brands.length > 0 &&
      !filters.brands.includes(p.brand ?? "")
    )
      return false;

    // Verified sellers only
    if (filters.verifiedOnly && !p.store?.isVerified) return false;

    return true;
  });

  // ── Sort ────────────────────────────────────────────────────────────────
  const sorted = [...filtered];
  switch (sortBy) {
    case "price-asc":
      sorted.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
      break;
    case "price-desc":
      sorted.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
      break;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      sorted.sort((a, b) => b.dummyProductId - a.dummyProductId);
      break;
    // "relevance" → verified stores first, then original order
    default:
      sorted.sort((a, b) => {
        const aVerified = a.store?.isVerified ? 1 : 0;
        const bVerified = b.store?.isVerified ? 1 : 0;
        return bVerified - aVerified;
      });
  }

  // ── Metadata (from full dataset, not filtered) ────────────────────────
  const categoryCounts: Record<string, number> = {};
  const subcategoryCounts: Record<string, number> = {};
  const brandCounts: Record<string, number> = {};
  const brandSet = new Set<string>();

  for (const p of allProducts) {
    categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
    if (p.subcategory) {
      subcategoryCounts[p.subcategory] = (subcategoryCounts[p.subcategory] ?? 0) + 1;
    }
    if (p.brand) {
      brandCounts[p.brand] = (brandCounts[p.brand] ?? 0) + 1;
      brandSet.add(p.brand);
    }
  }

  const allPrices = allProducts.map(getEffectivePrice);
  const priceRange = {
    min: Math.floor(Math.min(...allPrices)),
    max: Math.ceil(Math.max(...allPrices)),
  };

  // ── Paginate ─────────────────────────────────────────────────────────
  const total = sorted.length;
  const start = (page - 1) * limit;

  return {
    products: sorted.slice(start, start + limit),
    total,
    brands: [...brandSet].sort(),
    brandCounts,
    priceRange,
    categoryCounts,
    subcategoryCounts,
  };
}

export function hasActiveFilters(
  filters: ShopFilters,
  defaultMaxPrice = 10000
): boolean {
  return (
    filters.category !== null ||
    filters.subcategory !== null ||
    filters.minPrice > 0 ||
    filters.maxPrice < defaultMaxPrice ||
    filters.minRating > 0 ||
    filters.searchQuery !== "" ||
    filters.inStockOnly ||
    filters.brands.length > 0 ||
    filters.verifiedOnly
  );
}
