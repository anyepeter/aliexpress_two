"use client";

import { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { StoreInfo } from "@/lib/types/marketplace";

interface PremiumSellerStripProps {
  stores: StoreInfo[];
}

export default function PremiumSellerStrip({ stores }: PremiumSellerStripProps) {
  if (stores.length === 0) return null;

  // Only triple the list when there are enough stores to need looping.
  // With few stores, repeating them looks like a bug.
  const shouldLoop = stores.length >= 6;
  const display = shouldLoop ? [...stores, ...stores, ...stores] : stores;

  const containerRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);
  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const rafId = useRef<number>(0);

  // Auto-scroll loop: advances scrollLeft by ~0.5px per frame
  const autoScroll = useCallback(() => {
    const el = containerRef.current;
    if (el && !isHovered.current) {
      el.scrollLeft += 0.5;
      // When we've scrolled past the first copy, jump back seamlessly
      const oneSetWidth = el.scrollWidth / 3;
      if (el.scrollLeft >= oneSetWidth * 2) {
        el.scrollLeft -= oneSetWidth;
      }
    }
    rafId.current = requestAnimationFrame(autoScroll);
  }, []);

  useEffect(() => {
    if (!shouldLoop) return;
    // Start scrolled to the middle copy so we can scroll left too
    const el = containerRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth / 3;
    }
    rafId.current = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(rafId.current);
  }, [autoScroll, shouldLoop]);

  const handleMouseEnter = useCallback(() => {
    isHovered.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHovered.current = false;
    isDragging.current = false;
    const el = containerRef.current;
    if (el) el.style.cursor = "";
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    isDragging.current = true;
    didDrag.current = false;
    dragStartX.current = e.pageX;
    dragScrollLeft.current = el.scrollLeft;
    el.style.cursor = "grabbing";
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = containerRef.current;
    if (!el) return;
    e.preventDefault();
    const walk = e.pageX - dragStartX.current;
    if (Math.abs(walk) > 4) didDrag.current = true;
    el.scrollLeft = dragScrollLeft.current - walk;

    // Wrap around during drag too
    const oneSetWidth = el.scrollWidth / 3;
    if (el.scrollLeft >= oneSetWidth * 2) {
      el.scrollLeft -= oneSetWidth;
      dragScrollLeft.current -= oneSetWidth;
    } else if (el.scrollLeft < oneSetWidth * 0.1) {
      el.scrollLeft += oneSetWidth;
      dragScrollLeft.current += oneSetWidth;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    const el = containerRef.current;
    if (el) el.style.cursor = "";
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (didDrag.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-bold text-[#E53935] uppercase tracking-widest">
          Featured Stores of the day
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-[#E53935]/30 to-transparent" />
      </div>

      <div
        ref={containerRef}
        className="overflow-hidden cursor-grab py-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className="flex gap-3 w-max">
          {display.map((store, i) => (
            <Link
              key={`${store.id}-${i}`}
              href={`/store/${store.storeSlug}`}
              onClick={handleClick}
              draggable={false}
              className="flex flex-col items-center gap-1.5 w-[110px] p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:scale-105 transition-all duration-200 flex-shrink-0 select-none"
            >
              {store.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  alt={store.storeName}
                  width={48}
                  height={48}
                  className="rounded-full object-cover ring-2 ring-[#E53935]/30 flex-shrink-0 pointer-events-none"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#E53935] flex items-center justify-center ring-2 ring-[#E53935]/30 flex-shrink-0">
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
      </div>

      <style>{`
        .overflow-hidden::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
