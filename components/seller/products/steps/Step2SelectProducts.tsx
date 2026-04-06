"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { DummyProduct, DummyProductsResponse } from "@/lib/types/sellerProduct";
import ProductSelectionCard from "../ProductSelectionCard";

interface Step2SelectProductsProps {
  categories: string[];
  subcategories: string[];
  selected: number[]; // dummyProductIds
  existingProductIds: Set<number>; // already saved to this store — not selectable
  onNext: (products: DummyProduct[], selectedIds: number[]) => void;
  onBack: () => void;
}

export default function Step2SelectProducts({
  categories,
  subcategories,
  selected,
  existingProductIds,
  onNext,
  onBack,
}: Step2SelectProductsProps) {
  const [allProducts, setAllProducts] = useState<DummyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subFilter, setSubFilter] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<number>>(new Set(selected));

  // Fetch products for all selected categories
  useEffect(() => {
    if (categories.length === 0) return;
    setLoading(true);

    fetch(`/api/products/by-category?categories=${categories.join(",")}&limit=500`)
      .then((r) => r.json() as Promise<DummyProductsResponse>)
      .then((data) => data.products ?? [])
      .catch(() => [] as DummyProduct[])
      .then((flat) => {
        // Dedupe by id
        const seen = new Set<number>();
        let deduped = flat.filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
        // If user picked specific subcategories, only show those
        if (subcategories.length > 0) {
          deduped = deduped.filter((p) => !p.subcategory || subcategories.includes(p.subcategory));
        }
        setAllProducts(deduped);
      })
      .finally(() => setLoading(false));
  }, [categories, subcategories]);

  // Get available subcategories from loaded products
  const availableSubs = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of allProducts) {
      const sub = p.subcategory ?? "other";
      counts[sub] = (counts[sub] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [allProducts]);

  const filtered = useMemo(() => {
    let result = allProducts;

    // Subcategory filter
    if (subFilter) {
      result = result.filter((p) => (p.subcategory ?? "other") === subFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [allProducts, search, subFilter]);

  const toggle = (id: number) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedProducts = allProducts.filter((p) => picked.has(p.id));

  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Select Products</h2>
        <p className="text-sm text-gray-500 mt-1">
          Pick products from your chosen categories to add to your store.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#E53935]" />
          <span className="ml-2 text-sm text-gray-500">Loading products…</span>
        </div>
      ) : (
        <div>
            {/* Search + Select All */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#E53935]"
                />
              </div>
              {/* Select/Deselect all visible */}
              {filtered.length > 0 && (() => {
                const selectable = filtered.filter((p) => !existingProductIds.has(p.id));
                const allPicked = selectable.length > 0 && selectable.every((p) => picked.has(p.id));
                return (
                  <button
                    disabled={selectable.length === 0}
                    onClick={() => {
                      setPicked((prev) => {
                        const next = new Set(prev);
                        if (allPicked) {
                          selectable.forEach((p) => next.delete(p.id));
                        } else {
                          selectable.forEach((p) => next.add(p.id));
                        }
                        return next;
                      });
                    }}
                    className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-lg border-2 transition-colors whitespace-nowrap ${
                      allPicked
                        ? "border-[#E53935] bg-[#E53935] text-white hover:bg-[#C62828]"
                        : "border-[#E53935] text-[#E53935] hover:bg-[#C62828] hover:text-white"
                    }`}
                  >
                    {allPicked ? "Deselect All" : "Select All"}
                  </button>
                );
              })()}
            </div>

            {/* Subcategory filter pills */}
            {availableSubs.length > 1 && (
              <div className="flex gap-1.5 flex-wrap mb-3">
                <button
                  onClick={() => setSubFilter(null)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    subFilter === null
                      ? "bg-[#E53935] text-white border-[#E53935]"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#E53935] hover:text-[#E53935]"
                  }`}
                >
                  All ({allProducts.length})
                </button>
                {availableSubs.map(([slug, count]) => (
                  <button
                    key={slug}
                    onClick={() => setSubFilter(slug)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize ${
                      subFilter === slug
                        ? "bg-[#E53935] text-white border-[#E53935]"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#E53935] hover:text-[#E53935]"
                    }`}
                  >
                    {slug.replace(/-/g, " ")} ({count})
                  </button>
                ))}
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[480px] overflow-y-auto pr-1">
              {filtered.map((product) => (
                <ProductSelectionCard
                  key={product.id}
                  product={product}
                  selected={picked.has(product.id)}
                  disabled={existingProductIds.has(product.id)}
                  onToggle={() => toggle(product.id)}
                />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-400 text-sm">
                  No products found.
                </div>
              )}
            </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#E53935] font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            <span className="font-bold text-[#E53935]">{picked.size}</span> selected
          </span>
          <button
            onClick={() => onNext(selectedProducts, Array.from(picked))}
            disabled={picked.size === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#E53935] text-white rounded-xl font-semibold text-sm hover:bg-[#C62828] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Set Margins
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
