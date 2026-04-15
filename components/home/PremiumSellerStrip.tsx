"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { StoreInfo } from "@/lib/types/marketplace";

interface PremiumSellerStripProps {
  stores: StoreInfo[];
}

export default function PremiumSellerStrip({ stores }: PremiumSellerStripProps) {
  if (stores.length === 0) return null;

  // Deduplicate stores by id
  const uniqueStores = stores.filter(
    (store, idx, arr) => arr.findIndex((s) => s.id === store.id) === idx
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-bold text-[#E53935] uppercase tracking-widest">
          Featured Stores of the day
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-[#E53935]/30 to-transparent" />
      </div>

      <div className="relative group">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Scrollable store list */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto py-2 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {uniqueStores.map((store) => (
            <Link
              key={store.id}
              href={`/store/${store.storeSlug}`}
              className="flex flex-col items-center gap-1.5 w-[110px] min-w-[110px] p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:scale-105 transition-all duration-200 select-none"
            >
              {store.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  alt={store.storeName}
                  width={48}
                  height={48}
                  className="rounded-full object-cover ring-2 ring-[#E53935]/30 pointer-events-none"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#E53935] flex items-center justify-center ring-2 ring-[#E53935]/30">
                  <span className="text-white text-lg font-bold">
                    {store.storeName[0].toUpperCase()}
                  </span>
                </div>
              )}

              <span className="text-[11px] font-semibold text-[#1A1A1A] text-center leading-tight line-clamp-2 w-full">
                {store.storeName}
              </span>

              <span className="text-[9px] font-bold text-[#E53935] bg-[#E53935]/10 rounded-full px-2 py-0.5 whitespace-nowrap">
                ✓ Verified
              </span>
            </Link>
          ))}
        </div>

        <style>{`
          div[style*="scrollbar-width"]::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </section>
  );
}
