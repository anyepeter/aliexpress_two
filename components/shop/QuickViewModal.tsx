"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Star,
  ShoppingCart,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/lib/types/product";
import type { StoreInfo } from "@/lib/types/marketplace";
import { useCartStore } from "@/lib/store/cartStore";

interface QuickViewModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
  store?: StoreInfo | null;
  productId?: string;
}

export default function QuickViewModal({
  product,
  open,
  onClose,
  store,
  productId,
}: QuickViewModalProps) {
  const [imgIdx, setImgIdx] = useState(0);
  const [cartAdded, setCartAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const addMarketplaceItem = useCartStore((s) => s.addMarketplaceItem);
  const openCart = useCartStore((s) => s.openCart);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail];

  const discountedPrice =
    product.discountPercentage > 0
      ? product.price * (1 - product.discountPercentage / 100)
      : null;

  const fullStars = Math.floor(product.rating);
  const hasHalfStar = product.rating - fullStars >= 0.5;

  const handleAddToCart = () => {
    if (store && productId) {
      addMarketplaceItem({
        id: productId,
        dummyProductId: product.id,
        title: product.title,
        price: product.price,
        discountPercentage: product.discountPercentage,
        thumbnail: product.thumbnail,
        brand: product.brand ?? "MarketHub",
        category: product.category,
        quantity: 1,
        storeId: store.id,
        storeName: store.storeName,
        storeSlug: store.storeSlug,
        storeLogoUrl: store.logoUrl,
        isVerifiedStore: store.isVerified,
      });
    } else {
      addItem(product);
    }
    openCart();
    setCartAdded(true);
    setTimeout(() => {
      setCartAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl gap-0">
        <DialogTitle className="sr-only">{product.title} — Quick View</DialogTitle>

        <div className="flex flex-col sm:flex-row">
          {/* ── Image Panel ── */}
          <div className="relative sm:w-[45%] aspect-square bg-gray-50 flex-shrink-0">
            <Image
              src={images[imgIdx] ?? product.thumbnail}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 45vw"
            />

            {/* Image navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setImgIdx((i) => (i - 1 + images.length) % images.length)
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white z-10 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setImgIdx((i) => (i + 1) % images.length)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white z-10 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {/* Dot indicators */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                  {images.slice(0, 6).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`rounded-full transition-all ${
                        i === imgIdx
                          ? "bg-white w-3 h-1.5"
                          : "bg-white/60 w-1.5 h-1.5"
                      }`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Discount badge */}
            {product.discountPercentage > 0 && (
              <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md z-10">
                -{Math.round(product.discountPercentage)}%
              </div>
            )}
          </div>

          {/* ── Details Panel ── */}
          <div className="flex-1 p-5 flex flex-col gap-3 overflow-y-auto max-h-[500px]">
            {/* Category + Brand */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold bg-blue-50 text-[#E53935] px-2 py-0.5 rounded capitalize">
                {product.category.replace(/-/g, " ")}
              </span>
              {product.brand && (
                <span className="text-[10px] text-gray-400">
                  by{" "}
                  <span className="font-medium text-gray-600">
                    {product.brand}
                  </span>
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-base font-bold text-[#1A1A1A] leading-snug">
              {product.title}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < fullStars
                        ? "fill-[#E53935] text-[#E53935]"
                        : i === fullStars && hasHalfStar
                        ? "fill-[#E53935]/50 text-[#E53935]"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {product.rating.toFixed(1)}
              </span>
              {product.reviews && product.reviews.length > 0 && (
                <span className="text-xs text-gray-400">
                  ({product.reviews.length} reviews)
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#E53935]">
                $
                {discountedPrice
                  ? discountedPrice.toFixed(2)
                  : product.price.toFixed(2)}
              </span>
              {discountedPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Stock */}
            <div className="text-xs">
              {product.stock === 0 ? (
                <span className="text-red-500 font-semibold">Out of Stock</span>
              ) : product.stock <= 10 ? (
                <span className="text-orange-500 font-semibold">
                  Only {product.stock} left in stock
                </span>
              ) : (
                <span className="text-green-600 font-semibold">
                  In Stock ({product.stock} units)
                </span>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {images.slice(0, 6).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                      i === imgIdx
                        ? "border-[#E53935]"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`View ${i + 1}`}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                product.stock === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : cartAdded
                  ? "bg-green-600 text-white"
                  : "bg-[#E53935] text-white hover:bg-[#C62828]"
              }`}
            >
              {cartAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
