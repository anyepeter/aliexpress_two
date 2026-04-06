"use client";

import { useRef } from "react";
import { useShopStore } from "@/lib/store/shopStore";

const CATEGORY_LABELS: Record<string, string> = {
  electronics: "Electronics",
  "womens-apparel": "Women's Apparel",
  "mens-apparel": "Men's Apparel",
  "home-living": "Home & Living",
  jewelry: "Jewelry",
  "beauty-skincare": "Beauty & Skincare",
  "fashion-accessories": "Fashion Accessories",
  "bags-wallets": "Bags & Wallets",
  kitchen: "Kitchen",
  "sports-fitness": "Sports & Fitness",
  "tiktok-trending": "TikTok Trending",
  "pet-supplies": "Pet Supplies",
  "baby-kids": "Baby & Kids",
  "auto-accessories": "Auto Accessories",
  "stationery-office": "Stationery & Office",
  "hardware-tools": "Hardware & Tools",
};

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

  const handleClick = (slug: string | null) => {
    setFilter("category", slug);
    setFilter("subcategory", null);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 mb-3">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto px-4 py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {/* All pill */}
        <button
          onClick={() => handleClick(null)}
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
            onClick={() => handleClick(slug)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all border whitespace-nowrap ${
              category === slug
                ? "bg-[#E53935] text-white border-[#E53935] shadow-sm"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#E53935] hover:text-[#E53935]"
            }`}
          >
            {CATEGORY_LABELS[slug] ?? slug.replace(/-/g, " ")}
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
