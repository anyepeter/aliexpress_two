"use client";

import { useShopStore } from "@/lib/store/shopStore";
import type { SortOption } from "@/lib/store/shopStore";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

export default function SortDropdown() {
  const sortBy = useShopStore((s) => s.sortBy);
  const setSort = useShopStore((s) => s.setSort);

  return (
    <select
      value={sortBy}
      onChange={(e) => setSort(e.target.value as SortOption)}
      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:border-[#E53935] bg-white cursor-pointer"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
