"use client";

import { Star } from "lucide-react";
import { useShopStore } from "@/lib/store/shopStore";

const RATINGS = [
  { value: 0, label: "All Ratings" },
  { value: 4, label: "4★ & up" },
  { value: 3, label: "3★ & up" },
  { value: 2, label: "2★ & up" },
];

export default function RatingFilter() {
  const minRating = useShopStore((s) => s.filters.minRating);
  const setFilter = useShopStore((s) => s.setFilter);

  return (
    <div className="flex flex-col gap-1.5">
      {RATINGS.map(({ value, label }) => (
        <label
          key={value}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <input
            type="radio"
            name="rating"
            checked={minRating === value}
            onChange={() => setFilter("minRating", value)}
            className="accent-[#E53935] cursor-pointer"
          />
          <div className="flex items-center gap-1.5">
            {value > 0 && (
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < value
                        ? "fill-[#E53935] text-[#E53935]"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
            )}
            <span className="text-sm text-gray-700 group-hover:text-[#E53935] transition-colors">
              {label}
            </span>
          </div>
        </label>
      ))}
    </div>
  );
}
