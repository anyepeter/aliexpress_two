"use client";

import { useState, useEffect, useCallback } from "react";
import ProductCard, { ProductCardSkeleton } from "@/components/home/ProductCard";
import StoreSidebar from "./StoreSidebar";
import type { Product } from "@/lib/types/product";
import type { MarketplaceProduct, StoreInfo } from "@/lib/types/marketplace";

type SortOption = "relevance" | "price-asc" | "price-desc" | "newest";

/** Convert MarketplaceProduct → Product for ProductCard compatibility. */
function toProduct(p: MarketplaceProduct): Product {
  return {
    id: p.dummyProductId,
    title: p.title,
    description: p.description,
    price: p.sellingPrice,
    discountPercentage: p.discountPercentage,
    rating: p.rating,
    stock: p.stock,
    brand: p.brand,
    category: p.category,
    thumbnail: p.thumbnail,
    images: p.images,
  };
}

interface StoreProductsGridProps {
  initialProducts: MarketplaceProduct[];
  initialCategories: string[];
  initialTotal: number;
  initialHasMore: boolean;
  store: StoreInfo;
}

export default function StoreProductsGrid({
  initialProducts,
  initialCategories,
  initialTotal,
  initialHasMore,
  store,
}: StoreProductsGridProps) {
  const [products, setProducts] = useState<MarketplaceProduct[]>(initialProducts);
  const [categories] = useState<string[]>(initialCategories);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(
    async (cat: string | null, sortBy: SortOption, pg: number, append: boolean) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(pg), limit: "12", sort: sortBy });
        if (cat) params.set("category", cat);
        const res = await fetch(
          `/api/store/${store.storeSlug}/products?${params}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          products: MarketplaceProduct[];
          total: number;
          hasMore: boolean;
        };
        setProducts((prev) =>
          append ? [...prev, ...data.products] : data.products
        );
        setTotal(data.total);
        setHasMore(data.hasMore);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    },
    [store.storeSlug]
  );

  // Re-fetch when category or sort changes
  useEffect(() => {
    setPage(1);
    fetchProducts(category, sort, 1, false);
  }, [category, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchProducts(category, sort, next, true);
  };

  const handleCategoryChange = (cat: string | null) => {
    setCategory(cat);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <StoreSidebar
        categories={categories}
        selectedCategory={category}
        onCategoryChange={handleCategoryChange}
        productCount={total}
        storeName={store.storeName}
        memberSince={store.createdAt}
        storeUserId={store.userId}
      />

      {/* Main grid */}
      <div className="flex-1 min-w-0">
        {/* Header: count + sort */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <p className="text-sm text-gray-500">
            <span className="font-bold text-[#1A1A1A]">{total}</span> product
            {total !== 1 ? "s" : ""}
            {category && (
              <span>
                {" "}
                in{" "}
                <span className="font-medium text-[#E53935] capitalize">
                  {category.replace(/-/g, " ")}
                </span>
              </span>
            )}
          </p>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
          >
            <option value="relevance">Best Match</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Active category pill */}
        {category && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-[#E53935] bg-[#E53935]/10 rounded-full px-3 py-1 capitalize">
              {category.replace(/-/g, " ")}
            </span>
            <button
              onClick={() => handleCategoryChange(null)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              ✕ Clear
            </button>
          </div>
        )}

        {/* Grid */}
        {products.length === 0 && !loading ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm mt-1">Try a different category or sort order</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={toProduct(p)}
                productId={p.id}
                store={p.store}
              />
            ))}

            {/* Loading skeletons */}
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={`sk-${i}`} />
              ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              className="px-8 py-2.5 border-2 border-[#E53935] text-[#E53935] font-semibold rounded-full hover:bg-[#C62828] hover:text-white transition-all duration-200 text-sm"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
