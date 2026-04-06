"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import type { MarketplaceProduct } from "@/lib/types/marketplace";
import { useShopStore } from "@/lib/store/shopStore";
import { filterAndSortProducts } from "@/lib/utils/shop";
import FilterSidebar from "./FilterSidebar";
import ShopHeader from "./ShopHeader";
import CategoryStrip from "./CategoryStrip";
import ActiveFilters from "./ActiveFilters";
import ProductGrid from "./ProductGrid";

interface ShopContentProps {
  allProducts: MarketplaceProduct[];
  initialParams: Record<string, string>;
}

export default function ShopContent({
  allProducts,
  initialParams,
}: ShopContentProps) {
  const router = useRouter();
  const didInit = useRef(false);
  const didFirstSync = useRef(false);

  const { filters, sortBy, currentPage, itemsPerPage, initFromParams } =
    useShopStore();

  // ── 1. Initialize store from URL params (on mount & when params change) ───
  const paramsKey = JSON.stringify(initialParams);
  useEffect(() => {
    initFromParams(initialParams);
    didInit.current = true;
    didFirstSync.current = false; // Reset so the next sync doesn't push stale URL
    // Small delay to let the store settle before enabling URL sync
    requestAnimationFrame(() => {
      didFirstSync.current = true;
    });
  }, [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Sync store → URL (skip the very first invocation) ─────────────────
  useEffect(() => {
    if (!didFirstSync.current) {
      didFirstSync.current = true;
      return;
    }

    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.subcategory) params.set("subcategory", filters.subcategory);
    if (filters.searchQuery) params.set("q", filters.searchQuery);
    if (filters.minPrice > 0) params.set("min", String(filters.minPrice));
    if (filters.maxPrice < 10000) params.set("max", String(filters.maxPrice));
    if (filters.minRating > 0) params.set("rating", String(filters.minRating));
    if (filters.inStockOnly) params.set("stock", "1");
    if (filters.verifiedOnly) params.set("verified", "1");
    if (sortBy !== "relevance") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", String(currentPage));

    const qs = params.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
  }, [filters, sortBy, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 3. Filter + sort + paginate (memoized) ────────────────────────────────
  const result = useMemo(
    () =>
      filterAndSortProducts(allProducts, filters, sortBy, currentPage, itemsPerPage),
    [allProducts, filters, sortBy, currentPage, itemsPerPage]
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-4">
      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <FilterSidebar
          categoryCounts={result.categoryCounts}
          brands={result.brands}
          brandCounts={result.brandCounts}
          priceRange={result.priceRange}
          allProducts={allProducts}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <ShopHeader
            total={result.total}
            categoryCounts={result.categoryCounts}
            brands={result.brands}
            brandCounts={result.brandCounts}
            priceRange={result.priceRange}
          />
          <CategoryStrip categoryCounts={result.categoryCounts} />
          <ActiveFilters />
          <ProductGrid products={result.products} total={result.total} />
        </div>
      </div>
    </div>
  );
}
