"use client";

import { X } from "lucide-react";
import { useShopStore } from "@/lib/store/shopStore";
import { hasActiveFilters } from "@/lib/utils/shop";

export default function ActiveFilters() {
  const { filters, setFilter, toggleBrand, resetFilters } = useShopStore();

  if (!hasActiveFilters(filters)) return null;

  const pills: { label: string; onRemove: () => void }[] = [];

  if (filters.category) {
    pills.push({
      label: `Category: ${filters.category.replace(/-/g, " ")}`,
      onRemove: () => {
        setFilter("category", null);
        setFilter("subcategory", null);
      },
    });
  }

  if (filters.subcategory) {
    pills.push({
      label: `${filters.subcategory.replace(/-/g, " ")}`,
      onRemove: () => setFilter("subcategory", null),
    });
  }

  if (filters.minPrice > 0 || filters.maxPrice < 10000) {
    pills.push({
      label: `$${filters.minPrice} – $${filters.maxPrice === 10000 ? "10000+" : filters.maxPrice}`,
      onRemove: () => {
        setFilter("minPrice", 0);
        setFilter("maxPrice", 10000);
      },
    });
  }

  if (filters.minRating > 0) {
    pills.push({
      label: `${filters.minRating}★ & up`,
      onRemove: () => setFilter("minRating", 0),
    });
  }

  if (filters.searchQuery) {
    pills.push({
      label: `"${filters.searchQuery}"`,
      onRemove: () => setFilter("searchQuery", ""),
    });
  }

  if (filters.inStockOnly) {
    pills.push({
      label: "In Stock",
      onRemove: () => setFilter("inStockOnly", false),
    });
  }

  for (const brand of filters.brands) {
    pills.push({
      label: brand,
      onRemove: () => toggleBrand(brand),
    });
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-3 bg-white rounded-lg px-4 py-2.5 border border-gray-100">
      <span className="text-xs text-gray-500 font-medium flex-shrink-0">
        Active filters:
      </span>
      {pills.map((pill) => (
        <button
          key={pill.label}
          onClick={pill.onRemove}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#E53935]/10 text-[#E53935] text-xs font-medium rounded-full hover:bg-red-50 hover:text-red-600 transition-colors group capitalize"
        >
          {pill.label}
          <X className="w-3 h-3 group-hover:text-red-500 flex-shrink-0" />
        </button>
      ))}
      <button
        onClick={resetFilters}
        className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-500 text-xs font-medium rounded-full hover:bg-red-100 transition-colors ml-1"
      >
        Clear All
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
