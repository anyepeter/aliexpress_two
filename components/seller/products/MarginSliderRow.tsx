"use client";

import Image from "next/image";
import { TrendingUp } from "lucide-react";
import type { DummyProduct } from "@/lib/types/sellerProduct";

interface MarginSliderRowProps {
  product: DummyProduct;
  margin: number;
  onChange: (margin: number) => void;
}

const MIN_MARGIN = 8;
const MAX_MARGIN = 25;

export default function MarginSliderRow({
  product,
  margin,
  onChange,
}: MarginSliderRowProps) {
  const sellingPrice = product.price * (1 + margin / 100);
  const hasDiscount = product.discountPercentage > 0;
  const discountMultiplier = hasDiscount ? 1 - product.discountPercentage / 100 : 1;
  const buyerPays = sellingPrice * discountMultiplier;
  const profit = buyerPays - product.price * discountMultiplier;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 hover:border-[#E53935]/30 transition-colors">
      {/* Row 1: thumbnail + title + price */}
      <div className="flex items-center gap-3">
        {/* Thumbnail */}
        <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-contain p-1"
            sizes="48px"
          />
        </div>

        {/* Title + base price */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-[#1A1A1A] truncate">{product.title}</p>
            {hasDiscount && (
              <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded flex-shrink-0">
                -{Math.round(product.discountPercentage)}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Base: <span className="font-medium text-gray-600">${product.price.toFixed(2)}</span>
          </p>
        </div>

        {/* Margin % + selling price + profit */}
        <div className="flex-shrink-0 text-right">
          <div className="flex items-center gap-1 justify-end mb-0.5">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-sm font-bold text-[#E53935]">{margin.toFixed(1)}%</span>
          </div>
          <p className="text-sm font-bold text-[#1A1A1A]">${sellingPrice.toFixed(2)}</p>
          <p className="text-[10px] text-green-600 font-medium">+${profit.toFixed(2)}</p>
        </div>
      </div>

      {/* Row 2: full-width slider */}
      <div className="flex items-center gap-2 mt-2.5">
        <span className="text-[10px] text-gray-400 w-7 flex-shrink-0 text-right">{MIN_MARGIN}%</span>
        <input
          type="range"
          min={MIN_MARGIN}
          max={MAX_MARGIN}
          step={0.5}
          value={margin}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 accent-[#E53935] cursor-pointer"
        />
        <span className="text-[10px] text-gray-400 w-7 flex-shrink-0">{MAX_MARGIN}%</span>
      </div>
    </div>
  );
}
