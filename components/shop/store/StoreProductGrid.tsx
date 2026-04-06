"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Star, Heart, ShoppingBag } from "lucide-react";

export interface StoreProduct {
  id: string;
  title: string;
  images: string[];
  sellingPrice: number;
  rating: number | null;
  category: string;
}

function StoreProductCard({ product }: { product: StoreProduct }) {
  const allImages = [...new Set(product.images.filter(Boolean))];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [wished, setWished] = useState(false);
  const initialTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fullStars = Math.floor(product.rating ?? 0);
  const hasHalfStar = product.rating ? product.rating - fullStars >= 0.5 : false;

  const stopCycling = () => {
    if (initialTimer.current) { clearTimeout(initialTimer.current); initialTimer.current = null; }
    if (cycleTimer.current) { clearInterval(cycleTimer.current); cycleTimer.current = null; }
  };

  const handleMouseEnter = () => {
    if (allImages.length <= 1) return;
    setIsHovered(true);
    initialTimer.current = setTimeout(() => {
      setCurrentIndex(1);
      if (allImages.length >= 3) {
        cycleTimer.current = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % allImages.length);
        }, 800);
      }
    }, 400);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    stopCycling();
    setCurrentIndex(0);
  };

  const handleTouchStart = () => {
    if (allImages.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  useEffect(() => () => stopCycling(), []); // eslint-disable-line

  return (
    <div
      className="relative bg-white rounded-xl hover:shadow-sm transition-shadow duration-200 border border-gray-100 flex flex-col h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image container */}
      <div
        className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-100"
        onTouchStart={handleTouchStart}
      >
        {allImages.map((src, idx) => (
          <Image
            key={src}
            src={src}
            alt={`${product.title} - ${idx + 1}`}
            fill
            className={`object-cover absolute inset-0 transition-opacity duration-500 ease-in-out ${
              idx === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            priority={idx === 0}
          />
        ))}

        {/* Progress dots on hover */}
        <div
          className={`absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 transition-opacity duration-300 pointer-events-none ${
            isHovered && allImages.length > 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          {allImages.map((_, idx) => (
            <div
              key={idx}
              className={`rounded-full transition-all duration-300 drop-shadow-sm ${
                idx === currentIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Wishlist button — appears on hover */}
        <button
          onClick={() => setWished(!wished)}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center transition-all duration-200 hover:scale-110 z-10 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              wished ? "fill-red-500 text-red-500" : "text-gray-400"
            }`}
          />
        </button>

        {/* Slide-up "Shop Now" button */}
        <div
          className={`absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-[#E53935] hover:bg-[#C62828] transition-all duration-200 z-10 ${
            isHovered ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Shop Now
        </div>
      </div>

      {/* Card body */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <span className="text-[10px] font-semibold text-[#E53935] bg-[#E53935]/10 rounded-full px-2 py-0.5 w-fit leading-tight">
          ✓ Verified Seller
        </span>

        <h3 className="text-xs font-medium text-[#1A1A1A] line-clamp-2 leading-snug flex-1">
          {product.title}
        </h3>

        {/* Star rating */}
        {product.rating && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 ${
                    i < fullStars
                      ? "fill-[#E53935] text-[#E53935]"
                      : i === fullStars && hasHalfStar
                      ? "fill-[#E53935]/50 text-[#E53935]"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">{product.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-auto pt-1">
          <span className="text-sm font-bold text-[#1A1A1A]">
            ${product.sellingPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function StoreProductGrid({ products }: { products: StoreProduct[] }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
        Products
        <span className="ml-2 text-sm font-normal text-gray-400">({products.length})</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <StoreProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
