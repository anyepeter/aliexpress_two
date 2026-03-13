"use client";

import { useRef } from "react";
import Image from "next/image";
import { GripVertical, Star, Eye, EyeOff } from "lucide-react";
import type { DummyProduct } from "@/lib/types/sellerProduct";
import type { SavedSellerProduct } from "@/lib/types/sellerProduct";

interface DraggableProductRowProps {
  product: DummyProduct;
  saved: SavedSellerProduct;
  index: number;
  enabled: boolean;
  onToggle: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}

export default function DraggableProductRow({
  product,
  saved,
  index,
  enabled,
  onToggle,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isDragOver,
}: DraggableProductRowProps) {
  const dragRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={dragRef}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDrop={onDrop}
      className={`flex items-center gap-3 bg-white rounded-xl border-2 p-3 transition-all duration-200 cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-40 scale-95" : ""
      } ${isDragOver ? "border-[#E53935] bg-[#E53935]/5 shadow-md" : "border-gray-100 hover:border-gray-200"} ${
        !enabled ? "opacity-50" : ""
      }`}
    >
      {/* Drag handle */}
      <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />

      {/* Sort number */}
      <span className="text-xs font-bold text-gray-400 w-5 text-center flex-shrink-0">
        {index + 1}
      </span>

      {/* Thumbnail */}
      <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className="object-contain p-1"
          sizes="48px"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1A1A1A] truncate">{product.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-bold text-[#1A1A1A]">
            ${saved.sellingPrice.toFixed(2)}
          </span>
          <span className="text-[10px] text-gray-400">
            {saved.marginPercent.toFixed(1)}% margin
          </span>
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-[#E53935] fill-[#E53935]" />
            <span className="text-[10px] text-gray-500">{product.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Toggle publish */}
      <button
        onClick={() => onToggle(saved.id)}
        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
          enabled
            ? "bg-[#E53935] text-white hover:bg-[#C62828]"
            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
      >
        {enabled ? (
          <>
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Published</span>
          </>
        ) : (
          <>
            <EyeOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hidden</span>
          </>
        )}
      </button>
    </div>
  );
}
