"use client";

import { Package } from "lucide-react";
import type { MarketplaceProduct } from "@/lib/types/marketplace";
import type { Product } from "@/lib/types/product";
import { useShopStore } from "@/lib/store/shopStore";
import ProductCard from "@/components/home/ProductCard";

interface ProductGridProps {
  products: MarketplaceProduct[];
  total: number;
}

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

function Pagination({
  total,
  page,
  perPage,
  setPage,
}: {
  total: number;
  page: number;
  perPage: number;
  setPage: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const buildPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(page - 3, totalPages - 6));
    return Array.from({ length: Math.min(7, totalPages) }, (_, i) => start + i);
  };

  const pages = buildPages();

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      <button
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:border-[#E53935] hover:text-[#E53935] disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
      >
        Prev
      </button>

      {pages[0] > 1 && (
        <>
          <button
            onClick={() => setPage(1)}
            className="min-w-[2rem] h-8 text-sm rounded-lg border border-gray-200 text-gray-700 hover:border-[#E53935] hover:text-[#E53935] transition-colors bg-white"
          >
            1
          </button>
          {pages[0] > 2 && (
            <span className="text-gray-400 text-sm">…</span>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`min-w-[2rem] h-8 text-sm rounded-lg border transition-colors ${
            p === page
              ? "bg-[#E53935] text-white border-[#E53935]"
              : "border-gray-200 text-gray-700 hover:border-[#E53935] hover:text-[#E53935] bg-white"
          }`}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-gray-400 text-sm">…</span>
          )}
          <button
            onClick={() => setPage(totalPages)}
            className="min-w-[2rem] h-8 text-sm rounded-lg border border-gray-200 text-gray-700 hover:border-[#E53935] hover:text-[#E53935] transition-colors bg-white"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:border-[#E53935] hover:text-[#E53935] disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
      >
        Next
      </button>
    </div>
  );
}

export default function ProductGrid({ products, total }: ProductGridProps) {
  const { viewMode, currentPage, itemsPerPage, setPage } = useShopStore();

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Package className="w-16 h-16 text-gray-200 mb-4" />
        <h3 className="text-lg font-semibold text-gray-500 mb-1">
          No products found
        </h3>
        <p className="text-sm text-gray-400">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={toProduct(p)}
              productId={p.id}
              store={p.store}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={toProduct(p)}
              productId={p.id}
              store={p.store}
              viewMode="list"
            />
          ))}
        </div>
      )}

      <Pagination
        total={total}
        page={currentPage}
        perPage={itemsPerPage}
        setPage={setPage}
      />
    </div>
  );
}
