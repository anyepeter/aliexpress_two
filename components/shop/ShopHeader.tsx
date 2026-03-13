"use client";

import Link from "next/link";
import { LayoutGrid, List, ChevronRight } from "lucide-react";
import { useShopStore } from "@/lib/store/shopStore";
import type { ItemsPerPage } from "@/lib/store/shopStore";
import SortDropdown from "./SortDropdown";
import SearchWithinShop from "./SearchWithinShop";
import FilterDrawer from "./FilterDrawer";

const PER_PAGE_OPTIONS: ItemsPerPage[] = [20, 40, 60];

interface ShopHeaderProps {
  total: number;
  categoryCounts: Record<string, number>;
  brands: string[];
  brandCounts: Record<string, number>;
  priceRange: { min: number; max: number };
}

export default function ShopHeader({
  total,
  categoryCounts,
  brands,
  brandCounts,
  priceRange,
}: ShopHeaderProps) {
  const { viewMode, setViewMode, itemsPerPage, setItemsPerPage, filters } =
    useShopStore();

  const category = filters.category;

  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-sm mb-4">
      {/* Breadcrumb + result count */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <Link
          href="/"
          className="hover:text-[#E53935] transition-colors font-medium"
        >
          Home
        </Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <Link
          href="/shop"
          className="hover:text-[#E53935] transition-colors font-medium"
        >
          Shop
        </Link>
        {category && (
          <>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span className="text-[#E53935] font-semibold capitalize">
              {category.replace(/-/g, " ")}
            </span>
          </>
        )}
        <span className="ml-auto font-bold text-[#1A1A1A] flex-shrink-0">
          {total.toLocaleString()} result{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Mobile filter trigger */}
        <FilterDrawer
          categoryCounts={categoryCounts}
          brands={brands}
          brandCounts={brandCounts}
          priceRange={priceRange}
        />

        {/* Desktop search within */}
        <div className="hidden md:block">
          <SearchWithinShop />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Per-page selector */}
          <select
            value={itemsPerPage}
            onChange={(e) =>
              setItemsPerPage(Number(e.target.value) as ItemsPerPage)
            }
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-[#E53935] bg-white cursor-pointer hidden sm:block"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>

          {/* Sort */}
          <SortDropdown />

          {/* View mode toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-[#E53935] text-white"
                  : "text-gray-500 hover:text-[#E53935] hover:bg-gray-50"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-[#E53935] text-white"
                  : "text-gray-500 hover:text-[#E53935] hover:bg-gray-50"
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search (below controls) */}
      <div className="md:hidden mt-3">
        <SearchWithinShop />
      </div>
    </div>
  );
}
