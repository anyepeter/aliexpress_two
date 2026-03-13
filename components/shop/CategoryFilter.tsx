"use client";

import { useShopStore } from "@/lib/store/shopStore";

interface CategoryFilterProps {
  categoryCounts: Record<string, number>;
}

export default function CategoryFilter({
  categoryCounts,
}: CategoryFilterProps) {
  const category = useShopStore((s) => s.filters.category);
  const setFilter = useShopStore((s) => s.setFilter);

  const entries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const totalCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 cursor-pointer group">
        <input
          type="radio"
          name="category"
          checked={category === null}
          onChange={() => setFilter("category", null)}
          className="accent-[#E53935] cursor-pointer"
        />
        <span className="text-sm text-gray-700 group-hover:text-[#E53935] transition-colors flex-1">
          All Categories
        </span>
        <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 tabular-nums">
          {totalCount}
        </span>
      </label>

      {entries.map(([slug, count]) => (
        <label key={slug} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name="category"
            checked={category === slug}
            onChange={() => setFilter("category", slug)}
            className="accent-[#E53935] cursor-pointer"
          />
          <span className="text-sm text-gray-700 group-hover:text-[#E53935] transition-colors capitalize flex-1 leading-snug">
            {slug.replace(/-/g, " ")}
          </span>
          <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 tabular-nums">
            {count}
          </span>
        </label>
      ))}
    </div>
  );
}
