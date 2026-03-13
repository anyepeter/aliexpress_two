"use client";

import Image from "next/image";
import { Star, StoreIcon } from "lucide-react";
import type { DummyProduct } from "@/lib/types/sellerProduct";

interface ProductSelectionCardProps {
  product: DummyProduct;
  selected: boolean;
  disabled?: boolean; // already belongs to this store
  onToggle: () => void;
}

export default function ProductSelectionCard({
  product,
  selected,
  disabled = false,
  onToggle,
}: ProductSelectionCardProps) {
  return (
    <div
      onClick={disabled ? undefined : onToggle}
      className={`relative rounded-xl border-2 overflow-hidden group transition-all duration-200 ${
        disabled
          ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
          : selected
          ? "border-[#E53935] shadow-md bg-[#E53935]/5 cursor-pointer"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white cursor-pointer"
      }`}
    >
      {/* Top-left badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.discountPercentage > 0 && (
          <div className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md w-fit">
            -{Math.round(product.discountPercentage)}%
          </div>
        )}
        {disabled && (
          <div className="flex items-center gap-1 bg-[#E53935] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full w-fit">
            <StoreIcon className="w-2.5 h-2.5" />
            In Store
          </div>
        )}
      </div>

      {/* Selection indicator (only when not disabled) */}
      {!disabled && (
        <div
          className={`absolute top-2 right-2 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            selected
              ? "bg-[#E53935] border-[#E53935]"
              : "bg-white border-gray-300 group-hover:border-[#E53935]"
          }`}
        >
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}

      {/* Product image */}
      <div className="relative w-full aspect-square bg-gray-50">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className="object-contain p-2"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      </div>

      {/* Info */}
      <div className="p-2 sm:p-3">
        <p className="text-[11px] sm:text-xs font-semibold text-[#1A1A1A] line-clamp-2 leading-snug mb-1">
          {product.title}
        </p>
        {product.brand && (
          <p className="text-[10px] text-gray-400 mb-1 truncate">{product.brand}</p>
        )}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
              ${product.price.toFixed(2)}
            </span>
            {product.discountPercentage > 0 && (
              <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded">
                -{Math.round(product.discountPercentage)}%
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">Stock: {product.stock}</span>
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-[#E53935] fill-[#E53935]" />
              <span className="text-[10px] text-gray-500">{product.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
