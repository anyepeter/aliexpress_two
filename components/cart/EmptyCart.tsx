"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";

export default function EmptyCart() {
  const closeCart = useCartStore((state) => state.closeCart);

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-5">
        <ShoppingBag className="w-12 h-12 text-gray-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-600 mb-2">
        Your cart is empty
      </h3>
      <p className="text-sm text-gray-400 mb-8 max-w-xs leading-relaxed">
        Explore our products and add something you love
      </p>
      <button
        onClick={closeCart}
        className="px-7 py-2.5 bg-[#E53935] text-white text-sm font-semibold rounded-full hover:bg-[#C62828] transition-colors duration-200"
      >
        Start Shopping
      </button>
    </div>
  );
}
