"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/lib/store/cartStore";
import type { StoreCartGroup } from "@/lib/types/marketplace";
import CartItemComponent from "./CartItem";
import EmptyCart from "./EmptyCart";

function StoreGroupHeader({ group }: { group: StoreCartGroup }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#E53935]/5 border-l-4 border-[#E53935] rounded-r-lg mb-2">
      {group.logoUrl ? (
        <Image
          src={group.logoUrl}
          alt={group.storeName}
          width={20}
          height={20}
          className="rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-5 h-5 rounded-full bg-[#E53935] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[8px] font-bold">
            {group.storeName[0].toUpperCase()}
          </span>
        </div>
      )}
      <span className="text-xs font-bold text-[#1A1A1A] truncate flex-1">
        {group.storeName}
      </span>
      {group.isVerified && (
        <span className="text-[9px] font-bold text-[#1A1A1A] flex-shrink-0">
          ✓
        </span>
      )}
    </div>
  );
}

export default function CartDrawer() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { isOpen, closeCart, clearCart, items, getDiscountedPrice, getGroupedByStore } =
    useCartStore();

  const groups = getGroupedByStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce(
    (sum, item) => sum + getDiscountedPrice(item) * item.quantity,
    0
  );

  const originalTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const savings = originalTotal - totalPrice;
  const hasSavings = savings > 0.005;
  const storeCount = groups.filter((g) => g.storeId !== null).length;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-[420px] p-0 flex flex-col gap-0"
        >
          {/* ── Header ── */}
          <SheetHeader className="flex-shrink-0 px-5 py-4 border-b border-gray-100 bg-white gap-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#E53935]" />
                <SheetTitle className="text-base font-bold text-[#1A1A1A]">
                  Your Cart
                </SheetTitle>
                {totalItems > 0 && (
                  <span className="bg-[#E53935] text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
                    {totalItems}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Clear cart"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear all
                  </button>
                )}
                <button
                  onClick={closeCart}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </SheetHeader>

          {/* ── Grouped Items List ── */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="p-4 flex flex-col gap-5">
                {groups.map((group, groupIndex) => (
                  <div
                    key={group.storeId ?? "official"}
                    className="flex flex-col"
                    style={{
                      animation: "slideInUp 0.25s ease-out both",
                      animationDelay: `${groupIndex * 80}ms`,
                    }}
                  >
                    <StoreGroupHeader group={group} />

                    <div className="flex flex-col gap-3 pl-1">
                      {group.items.map((item) => (
                        <CartItemComponent key={item.id} item={item} />
                      ))}
                    </div>

                    {/* Per-group subtotal */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 px-1">
                      <span className="text-[11px] text-gray-400">
                        {group.storeName} subtotal
                      </span>
                      <span className="text-xs font-bold text-[#1A1A1A]">
                        ${group.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="h-2" />
              </div>
            )}
          </div>

          {/* ── Sticky Summary Panel ── */}
          {items.length > 0 && (
            <div className="flex-shrink-0 border-t border-gray-100 bg-white">
              <div className="p-5 space-y-3">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                    {storeCount > 0 && (
                      <span className="text-[10px] text-gray-400 ml-1">
                        · {storeCount} store{storeCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </span>
                  <span className="text-base font-bold text-[#1A1A1A]">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Savings */}
                {hasSavings && (
                  <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                    <span className="text-xs font-medium text-green-700">
                      🎉 You save
                    </span>
                    <span className="text-xs font-bold text-green-700">
                      -${savings.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="pt-1 space-y-2.5">
                  <button
                    onClick={closeCart}
                    className="w-full py-2.5 border-2 border-[#E53935] text-[#E53935] text-sm font-semibold rounded-xl hover:bg-[#C62828]/5 transition-colors"
                  >
                    Continue Shopping
                  </button>

                  <button
                    onClick={() => {
                      closeCart();
                      if (isSignedIn) {
                        router.push("/checkout");
                      } else {
                        router.push("/auth/register/buyer?redirect=/checkout");
                      }
                    }}
                    className="w-full py-3 bg-[#E53935] text-white text-sm font-bold rounded-xl hover:bg-[#C62828] transition-colors"
                  >
                    {isSignedIn ? "Proceed to Checkout" : "Sign In to Checkout"}
                  </button>

                  <p className="text-center text-[11px] text-gray-400 pt-0.5">
                    🔒 Secure checkout &nbsp;•&nbsp; Free returns
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Keyframe for staggered group slide-in */}
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
