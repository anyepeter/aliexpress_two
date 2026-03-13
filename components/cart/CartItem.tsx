"use client";

import Image from "next/image";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import type { CartItem as CartItemType } from "@/lib/store/cartStore";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity, getDiscountedPrice } = useCartStore();

  const discountedPrice = getDiscountedPrice(item);
  const hasDiscount = item.discountPercentage > 0;
  const itemTotal = discountedPrice * item.quantity;

  const handleQtyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      updateQuantity(item.id, val);
    }
  };

  const handleQtyBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      updateQuantity(item.id, 1);
    }
  };

  return (
    <div className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
      {/* Thumbnail */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
        <Image
          src={item.thumbnail}
          alt={item.title}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold text-[#1A1A1A] leading-snug line-clamp-1 mb-0.5">
          {item.title}
        </h4>
        <p className="text-[10px] text-gray-400 mb-1.5 capitalize">
          {item.brand} · {item.category}
        </p>

        {/* Price */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="text-sm font-bold text-[#1A1A1A]">
            ${discountedPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              ${item.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#E53935] hover:text-[#E53935] transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </button>

          <input
            type="number"
            value={item.quantity}
            min={1}
            max={99}
            onChange={handleQtyInput}
            onBlur={handleQtyBlur}
            className="w-10 h-6 text-center text-xs font-semibold border border-gray-200 rounded-md focus:outline-none focus:border-[#E53935] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={item.quantity >= 99}
            className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#E53935] hover:text-[#E53935] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Right: Trash + Subtotal */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <button
          onClick={() => removeItem(item.id)}
          className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          aria-label={`Remove ${item.title}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-[#1A1A1A]">
          ${itemTotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
