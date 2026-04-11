"use client";

import { useState } from "react";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import SectionHeader from "./SectionHeader";
import type { Product } from "@/lib/types/product";
import type { MarketplaceProduct } from "@/lib/types/marketplace";

const PAGE_SIZE = 10;

/** Convert a MarketplaceProduct to a Product shape for ProductCard. */
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

interface FeaturedProductsProps {
  initialProducts: MarketplaceProduct[];
}

export default function FeaturedProducts({
  initialProducts,
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<MarketplaceProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(
    initialProducts.length >= PAGE_SIZE
  );

  const loadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(
        `/api/products/featured?page=${nextPage}&limit=${PAGE_SIZE}`
      );
      if (res.ok) {
        const data = (await res.json()) as {
          products: MarketplaceProduct[];
          hasMore: boolean;
        };
        setProducts((prev) => [...prev, ...data.products]);
        setHasMore(data.hasMore);
        setPage(nextPage);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6">
      <SectionHeader
        title="Featured Products"
        subtitle="Handpicked deals from verified sellers"
        viewAllHref="/shop"
      />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={toProduct(p)}
            productId={p.id}
            store={p.store}
          />
        ))}
        {loading &&
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <ProductCardSkeleton key={`sk-${i}`} />
          ))}
      </div>

      {hasMore && !loading && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            className="px-8 py-3 border-2 border-[#E53935] text-[#E53935] font-semibold rounded-full hover:bg-[#C62828] hover:text-white transition-all duration-200 text-sm"
          >
            Load More Products
          </button>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <p className="text-center text-sm text-gray-400 mt-8">
          You&apos;ve seen all featured products
        </p>
      )}
    </section>
  );
}
