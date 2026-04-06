"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types/product";
import type { MarketplaceProduct, StoreInfo } from "@/lib/types/marketplace";

interface FlashDealsProps {
  products: MarketplaceProduct[];
  store: StoreInfo | null;
}

/** Convert MarketplaceProduct → Product for ProductCard compatibility. */
function toProduct(p: MarketplaceProduct): Product {
  return {
    id: p.dummyProductId,
    title: p.title,
    description: p.description,
    price: p.sellingPrice,
    discountPercentage: p.discountPercentage,
    rating: p.rating,
    stock: p.stock,
    brand: p.brand,
    category: p.category,
    thumbnail: p.thumbnail,
    images: p.images,
  };
}

function useCountdown(initialHours: number) {
  const [endTime] = useState(() => Date.now() + initialHours * 60 * 60 * 1000);
  const [display, setDisplay] = useState({ h: "06", m: "00", s: "00" });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, endTime - Date.now());
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setDisplay({
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return display;
}

function TimeUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="bg-[#E53935] text-white font-mono font-bold text-sm px-2.5 py-1 rounded-md min-w-[2.5rem] text-center leading-tight">
        {value}
      </span>
      <span className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

export default function FlashDeals({ products, store }: FlashDealsProps) {
  const time = useCountdown(6);

  if (products.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#E53935] fill-[#E53935]" />
            <h2 className="text-xl font-extrabold text-[#1A1A1A] md:text-2xl">
              Flash Deals
            </h2>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-1">
            <TimeUnit value={time.h} label="hrs" />
            <span className="text-[#E53935] font-bold text-lg pb-3.5">:</span>
            <TimeUnit value={time.m} label="min" />
            <span className="text-[#E53935] font-bold text-lg pb-3.5">:</span>
            <TimeUnit value={time.s} label="sec" />
          </div>
        </div>

        {/* Store badge + View All link */}
        <div className="hidden sm:flex items-center gap-3">
          {store && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {store.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  alt={store.storeName}
                  width={20}
                  height={20}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#E53935] flex items-center justify-center">
                  <span className="text-white text-[7px] font-bold">
                    {store.storeName[0].toUpperCase()}
                  </span>
                </div>
              )}
              <span className="font-medium text-[#1A1A1A]">{store.storeName}</span>
              {store.isVerified && (
                <span className="text-[9px] font-bold text-[#E53935]">✓</span>
              )}
            </div>
          )}
          <Link
            href={store ? `/store/${store.storeSlug}` : "/shop"}
            className="text-sm font-semibold text-[#E53935] hover:text-[#E53935] transition-colors flex items-center gap-1"
          >
            View All →
          </Link>
        </div>
      </div>

      {/* Scrollable Product Row */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3 snap-x snap-mandatory -mx-4 px-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex-shrink-0 w-40 sm:w-44 md:w-48 snap-start"
          >
            <ProductCard
              product={toProduct(p)}
              productId={p.id}
              store={p.store}
            />
          </div>
        ))}
      </div>

      {/* Mobile View All */}
      {store && (
        <div className="flex justify-center mt-3 sm:hidden">
          <Link
            href={`/store/${store.storeSlug}`}
            className="text-sm font-semibold text-[#E53935] hover:text-[#E53935] transition-colors"
          >
            View All from {store.storeName} →
          </Link>
        </div>
      )}
    </section>
  );
}
