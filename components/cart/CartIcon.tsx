"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";

export default function CartIcon() {
  const [mounted, setMounted] = useState(false);
  const [bounce, setBounce] = useState(false);

  const openCart = useCartStore((state) => state.openCart);
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Bounce animation when cart count changes
  useEffect(() => {
    if (!mounted || totalItems === 0) return;
    setBounce(true);
    const timer = setTimeout(() => setBounce(false), 400);
    return () => clearTimeout(timer);
  }, [totalItems, mounted]);

  return (
    <button
      onClick={openCart}
      className="relative flex items-center gap-1.5 p-2 rounded-lg text-gray-600 hover:text-[#E53935] hover:bg-gray-50 transition-colors"
      aria-label={`Open cart${mounted && totalItems > 0 ? `, ${totalItems} items` : ""}`}
    >
      <ShoppingCart className="w-5 h-5" />

      {/* Badge — only shown after hydration to avoid mismatch */}
      {mounted && totalItems > 0 && (
        <span
          className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#E53935] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 transition-transform duration-200 ${
            bounce ? "scale-125" : "scale-100"
          }`}
        >
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}

      <span className="hidden md:inline text-xs font-medium">Cart</span>
    </button>
  );
}
