"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types/product";

const categoryEmojis: Record<string, string> = {
  beauty: "💄",
  fragrances: "🌸",
  furniture: "🛋️",
  groceries: "🛒",
  "home-decoration": "🏡",
  "kitchen-accessories": "🍳",
  laptops: "💻",
  "mens-shirts": "👔",
  "mens-shoes": "👟",
  "mens-watches": "⌚",
  "mobile-accessories": "📱",
  motorcycle: "🏍️",
  "skin-care": "✨",
  smartphones: "📲",
  "sports-accessories": "⚽",
  sunglasses: "🕶️",
  tablets: "📟",
  tops: "👕",
  vehicle: "🚗",
  "womens-bags": "👜",
  "womens-dresses": "👗",
  "womens-jewellery": "💍",
  "womens-shoes": "👠",
  "womens-watches": "⌚",
};

interface CategoryBarProps {
  categories: Category[];
}

export default function CategoryBar({ categories }: CategoryBarProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCategory = (slug: string | null) => {
    if (slug === null) {
      router.push("/shop");
    } else {
      router.push(`/shop?category=${encodeURIComponent(slug)}`);
    }
  };

  return (
    <section className="bg-white border-b border-gray-200 sticky top-[56px] z-30 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4">
        <div
          ref={scrollRef}
          className="flex gap-1 overflow-x-auto no-scrollbar py-2.5"
        >
          <button
            onClick={() => handleCategory(null)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 whitespace-nowrap text-gray-600 hover:text-[#E53935] hover:bg-blue-50"
          >
            🏪 All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategory(cat.slug)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 whitespace-nowrap text-gray-600 hover:text-[#E53935] hover:bg-blue-50"
            >
              <span role="img" aria-label={cat.name}>
                {categoryEmojis[cat.slug] ?? "📦"}
              </span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
