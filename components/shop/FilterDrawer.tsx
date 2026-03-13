"use client";

import { useState } from "react";
import { SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useShopStore } from "@/lib/store/shopStore";
import { hasActiveFilters } from "@/lib/utils/shop";
import CategoryFilter from "./CategoryFilter";
import PriceRangeSlider from "./PriceRangeSlider";
import RatingFilter from "./RatingFilter";

interface FilterDrawerProps {
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
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0">
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

export default function FilterDrawer({
  categoryCounts,
  brands,
  brandCounts,
  priceRange,
}: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const { filters, toggleBrand, setFilter, resetFilters } = useShopStore();
  const isFiltered = hasActiveFilters(filters);

  const visibleBrands = showAllBrands ? brands : brands.slice(0, 8);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-[#E53935] hover:text-[#E53935] transition-colors bg-white">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {isFiltered && (
            <span className="ml-0.5 bg-[#E53935] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              ✓
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="h-[85vh] overflow-y-auto rounded-t-2xl px-5 pb-0"
      >
        <SheetHeader className="sticky top-0 bg-white py-4 border-b border-gray-100 mb-4 -mx-5 px-5">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-bold text-[#1A1A1A]">
              Filters
            </SheetTitle>
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-[#E53935] font-medium hover:text-[#C62828] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>
        </SheetHeader>

        <Section title="Category">
          <CategoryFilter categoryCounts={categoryCounts} />
        </Section>

        <Section title="Price Range">
          <PriceRangeSlider min={priceRange.min} max={priceRange.max} />
        </Section>

        <Section title="Customer Rating">
          <RatingFilter />
        </Section>

        <Section title="Availability">
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

        {brands.length > 0 && (
          <Section title="Brand">
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
                  <span className="text-sm text-gray-700 group-hover:text-[#E53935] transition-colors flex-1">
                    {brand}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({brandCounts[brand] ?? 0})
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

        {/* Apply button — sticky bottom */}
        <div className="sticky bottom-0 bg-white py-4 border-t border-gray-100 mt-4 -mx-5 px-5">
          <button
            onClick={() => setOpen(false)}
            className="w-full py-3 bg-[#E53935] text-white rounded-xl font-semibold text-sm hover:bg-[#C62828] transition-colors"
          >
            Show Results
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
