"use client";

import { useState, useEffect } from "react";
import { useShopStore } from "@/lib/store/shopStore";

const QUICK_PRICES = [
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25 – $100", min: 25, max: 100 },
  { label: "$100 – $500", min: 100, max: 500 },
  { label: "Over $500", min: 500, max: 10000 },
];

interface PriceRangeSliderProps {
  min: number;
  max: number;
}

export default function PriceRangeSlider({ min, max }: PriceRangeSliderProps) {
  const minPrice = useShopStore((s) => s.filters.minPrice);
  const maxPrice = useShopStore((s) => s.filters.maxPrice);
  const setFilter = useShopStore((s) => s.setFilter);

  const [localMin, setLocalMin] = useState(String(minPrice));
  const [localMax, setLocalMax] = useState(String(maxPrice));

  // Keep local in sync when store resets
  useEffect(() => {
    setLocalMin(String(minPrice));
    setLocalMax(String(maxPrice));
  }, [minPrice, maxPrice]);

  const applyRange = () => {
    const parsedMin = Math.max(0, parseFloat(localMin) || 0);
    const parsedMax = Math.min(
      max || 10000,
      parseFloat(localMax) || max || 10000
    );
    setFilter("minPrice", parsedMin);
    setFilter("maxPrice", parsedMax);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Quick Pills */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_PRICES.map((p) => {
          const isActive = minPrice === p.min && maxPrice === p.max;
          return (
            <button
              key={p.label}
              onClick={() => {
                setLocalMin(String(p.min));
                setLocalMax(String(p.max));
                setFilter("minPrice", p.min);
                setFilter("maxPrice", p.max);
              }}
              className={`text-xs px-2 py-1 rounded-full border transition-all ${
                isActive
                  ? "bg-[#E53935] text-white border-[#E53935]"
                  : "border-gray-200 text-gray-600 hover:border-[#E53935] hover:text-[#E53935]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Min/Max Inputs */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            $
          </span>
          <input
            type="number"
            min={min}
            max={max}
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            onBlur={applyRange}
            onKeyDown={(e) => e.key === "Enter" && applyRange()}
            placeholder="Min"
            className="w-full pl-5 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#E53935] bg-white"
          />
        </div>
        <span className="text-gray-400 text-xs flex-shrink-0">–</span>
        <div className="flex-1 relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            $
          </span>
          <input
            type="number"
            min={min}
            max={max}
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            onBlur={applyRange}
            onKeyDown={(e) => e.key === "Enter" && applyRange()}
            placeholder="Max"
            className="w-full pl-5 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#E53935] bg-white"
          />
        </div>
        <button
          onClick={applyRange}
          className="text-xs px-2.5 py-1.5 bg-[#E53935] text-white rounded-lg hover:bg-[#C62828] transition-colors flex-shrink-0"
        >
          Go
        </button>
      </div>
    </div>
  );
}
