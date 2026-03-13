"use client";

import { useRef } from "react";
import { useShopStore } from "@/lib/store/shopStore";

interface CategoryStripProps {
  categoryCounts: Record<string, number>;
}

export default function CategoryStrip({ categoryCounts }: CategoryStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const category = useShopStore((s) => s.filters.category);
  const setFilter = useShopStore((s) => s.setFilter);

  const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  const categories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  if (categories.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm mb-4">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto px-4 py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {/* All pill */}
        <button
          onClick={() => setFilter("category", null)}
          className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
            category === null
              ? "bg-[#E53935] text-white border-[#E53935] shadow-sm"
              : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#E53935] hover:text-[#E53935]"
          }`}
        >
          All
          <span
            className={`text-[10px] tabular-nums leading-none ${
              category === null ? "text-white/70" : "text-gray-400"
            }`}
          >
            {total}
          </span>
        </button>

        {categories.map(([slug, count]) => (
          <button
            key={slug}
            onClick={() => setFilter("category", slug)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all border whitespace-nowrap capitalize ${
              category === slug
                ? "bg-[#E53935] text-white border-[#E53935] shadow-sm"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#E53935] hover:text-[#E53935]"
            }`}
          >
            {slug.replace(/-/g, " ")}
            <span
              className={`text-[10px] tabular-nums leading-none ${
                category === slug ? "text-white/70" : "text-gray-400"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
