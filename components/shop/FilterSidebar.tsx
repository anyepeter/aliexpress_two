"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useShopStore } from "@/lib/store/shopStore";
import { hasActiveFilters } from "@/lib/utils/shop";
import CategoryFilter from "./CategoryFilter";
import PriceRangeSlider from "./PriceRangeSlider";
import RatingFilter from "./RatingFilter";

interface FilterSidebarProps {
  categoryCounts: Record<string, number>;
  brands: string[];
  brandCounts: Record<string, number>;
  priceRange: { min: number; max: number };
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-semibold text-[#1A1A1A] mb-2"
      >
        {title}
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
      {open && children}
    </div>
  );
}

export default function FilterSidebar({
  categoryCounts,
  brands,
  brandCounts,
  priceRange,
}: FilterSidebarProps) {
  const { filters, toggleBrand, setFilter, resetFilters } = useShopStore();
  const [showAllBrands, setShowAllBrands] = useState(false);
  const isFiltered = hasActiveFilters(filters);

  const visibleBrands = showAllBrands ? brands : brands.slice(0, 8);

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="bg-white rounded-xl p-5 sticky top-[120px] shadow-sm max-h-[calc(100vh-140px)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#1A1A1A] text-sm">Filters</h2>
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-[#E53935] hover:text-[#C62828] transition-colors font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>

        {/* Sellers
        <Section title="Sellers">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => setFilter("verifiedOnly", e.target.checked)}
              className="accent-[#E53935] cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-[#E53935] transition-colors flex-1">
              Verified Sellers Only
            </span>
            <span className="text-[9px] font-bold text-[#E53935] bg-[#E53935]/10 rounded-full px-1.5 py-0.5 flex-shrink-0">
              ✓
            </span>
          </label>
        </Section> */}

        {/* Category */}
        <Section title="Category">
          <CategoryFilter categoryCounts={categoryCounts} />
        </Section>

        {/* Price */}
        <Section title="Price Range">
          <PriceRangeSlider min={priceRange.min} max={priceRange.max} />
        </Section>

        {/* Rating */}
        <Section title="Customer Rating">
          <RatingFilter />
        </Section>

        {/* Availability */}
        <Section title="Availability" defaultOpen={false}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => setFilter("inStockOnly", e.target.checked)}
              className="accent-[#E53935] cursor-pointer"
            />
            <span className="text-sm text-gray-700">In Stock Only</span>
          </label>
        </Section>

        {/* Brands */}
        {brands.length > 0 && (
          <Section title="Brand" defaultOpen={false}>
            <div className="flex flex-col gap-1.5">
              {visibleBrands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="accent-[#E53935] cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-[#E53935] transition-colors flex-1 leading-snug">
                    {brand}
                  </span>
                  <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 tabular-nums">
                    {brandCounts[brand] ?? 0}
                  </span>
                </label>
              ))}
              {brands.length > 8 && (
                <button
                  onClick={() => setShowAllBrands(!showAllBrands)}
                  className="text-xs text-[#E53935] font-medium hover:text-[#E53935] transition-colors mt-1 text-left"
                >
                  {showAllBrands ? "Show Less" : `+${brands.length - 8} more`}
                </button>
              )}
            </div>
          </Section>
        )}
      </div>
    </aside>
  );
}
