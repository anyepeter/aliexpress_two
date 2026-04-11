"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useShopStore } from "@/lib/store/shopStore";
import type { MarketplaceProduct } from "@/lib/types/marketplace";

// ── Category display names ────────────────────────────────────────
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

const SUBCATEGORY_LABELS: Record<string, string> = {
  "phone-accessories": "Phone Accessories",
  "chargers-cables": "Chargers & Cables",
  earbuds: "Earbuds & Headphones",
  "screen-protectors": "Screen Protectors",
  "smart-gadgets": "Smart Gadgets",
  dresses: "Dresses",
  "tops-blouses": "Tops & Blouses",
  skirts: "Skirts",
  shoes: "Shoes",
  activewear: "Activewear",
  "t-shirts": "T-Shirts",
  shirts: "Shirts",
  pants: "Pants",
  hoodies: "Hoodies",
  jackets: "Jackets",
  "pillows-bedding": "Pillows & Bedding",
  curtains: "Curtains",
  lighting: "Lighting",
  storage: "Storage",
  decor: "Decor",
  pantry: "Pantry",
  rings: "Rings",
  necklaces: "Necklaces",
  bracelets: "Bracelets",
  "earrings-necklaces": "Earrings & Necklaces",
  watches: "Watches",
  earrings: "Earrings",
  "face-care": "Face Care",
  "lip-products": "Lip Products",
  "eye-makeup": "Eye Makeup",
  "tools-brushes": "Tools & Brushes",
  fragrances: "Fragrances",
  "hair-care": "Hair Care",
  sunglasses: "Sunglasses",
  "hats-caps": "Hats & Caps",
  scarves: "Scarves",
  belts: "Belts",
  "hair-accessories": "Hair Accessories",
  handbags: "Handbags",
  backpacks: "Backpacks",
  "crossbody-bags": "Crossbody Bags",
  wallets: "Wallets",
  "travel-bags": "Travel Bags",
  utensils: "Utensils",
  gadgets: "Gadgets",
  drinkware: "Drinkware",
  bakeware: "Bakeware",
  yoga: "Yoga",
  "gym-equipment": "Gym Equipment",
  sportswear: "Sportswear",
  "water-bottles": "Water Bottles",
  outdoor: "Outdoor",
  "led-lights": "LED Lights",
  "aesthetic-room": "Aesthetic Room",
  "mini-gadgets": "Mini Gadgets",
  "fun-items": "Fun Items",
  "dog-toys": "Dog Toys",
  "cat-toys": "Cat Toys",
  "pet-beds": "Pet Beds",
  feeders: "Feeders",
  grooming: "Grooming",
  toys: "Toys",
  clothing: "Clothing",
  "bottles-feeding": "Bottles & Feeding",
  carriers: "Carriers",
  safety: "Safety",
  "phone-mounts": "Phone Mounts",
  "seat-covers": "Seat Covers",
  "led-strips": "LED Strips",
  organizers: "Organizers",
  "dash-cams": "Dash Cams",
  notebooks: "Notebooks",
  pens: "Pens",
  "desk-organizers": "Desk Organizers",
  "art-supplies": "Art Supplies",
  planners: "Planners",
  "hand-tools": "Hand Tools",
  "led-bulbs": "LED Bulbs",
  "tape-adhesives": "Tape & Adhesives",
  measuring: "Measuring",
  "power-accessories": "Power Accessories",
};

interface CategoryFilterProps {
  categoryCounts: Record<string, number>;
  allProducts?: MarketplaceProduct[];
}

export default function CategoryFilter({
  categoryCounts,
  allProducts,
}: CategoryFilterProps) {
  const category = useShopStore((s) => s.filters.category);
  const subcategory = useShopStore((s) => s.filters.subcategory);
  const setFilter = useShopStore((s) => s.setFilter);
  const [expanded, setExpanded] = useState<string | null>(category);

  const entries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  // Build subcategory counts per category from allProducts
  const subcatsByCategory: Record<string, Record<string, number>> = {};
  if (allProducts) {
    for (const p of allProducts) {
      if (p.subcategory) {
        if (!subcatsByCategory[p.category]) subcatsByCategory[p.category] = {};
        subcatsByCategory[p.category][p.subcategory] =
          (subcatsByCategory[p.category][p.subcategory] ?? 0) + 1;
      }
    }
  }

  const handleCategoryClick = (slug: string) => {
    if (category === slug) {
      // Clicking same category → deselect
      setFilter("category", null);
      setFilter("subcategory", null);
      setExpanded(null);
    } else {
      setFilter("category", slug);
      setFilter("subcategory", null);
      setExpanded(slug);
    }
  };

  const handleSubcategoryClick = (cat: string, sub: string) => {
    setFilter("category", cat);
    if (subcategory === sub) {
      setFilter("subcategory", null);
    } else {
      setFilter("subcategory", sub);
    }
  };

  const toggleExpand = (slug: string) => {
    setExpanded(expanded === slug ? null : slug);
  };

  return (
    <div className="flex flex-col gap-0.5">
      {/* All Categories */}
      <button
        onClick={() => {
          setFilter("category", null);
          setFilter("subcategory", null);
          setExpanded(null);
        }}
        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors w-full text-left ${
          category === null
            ? "bg-[#E53935]/10 text-[#E53935] font-semibold"
            : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span className="flex-1">All Categories</span>
      </button>

      {entries.map(([slug]) => {
        const isActive = category === slug;
        const isExpanded = expanded === slug;
        const subcats = subcatsByCategory[slug];
        const hasSubcats = subcats && Object.keys(subcats).length > 0;

        return (
          <div key={slug}>
            <div className="flex items-center">
              {/* Expand toggle */}
              {hasSubcats && (
                <button
                  onClick={() => toggleExpand(slug)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              {/* Category button */}
              <button
                onClick={() => handleCategoryClick(slug)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors flex-1 text-left ${
                  !hasSubcats ? "ml-5" : ""
                } ${
                  isActive
                    ? "bg-[#E53935]/10 text-[#E53935] font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="flex-1 leading-snug">
                  {CATEGORY_LABELS[slug] ?? slug.replace(/-/g, " ")}
                </span>
              </button>
            </div>

            {/* Subcategories */}
            {hasSubcats && isExpanded && (
              <div className="ml-6 pl-3 border-l-2 border-gray-100 flex flex-col gap-0.5 mt-0.5 mb-1">
                {Object.entries(subcats)
                  .sort((a, b) => b[1] - a[1])
                  .map(([subSlug]) => (
                    <button
                      key={subSlug}
                      onClick={() => handleSubcategoryClick(slug, subSlug)}
                      className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors w-full text-left ${
                        subcategory === subSlug
                          ? "bg-[#E53935]/10 text-[#E53935] font-semibold"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }`}
                    >
                      <span className="flex-1 leading-snug">
                        {SUBCATEGORY_LABELS[subSlug] ?? subSlug.replace(/-/g, " ")}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
