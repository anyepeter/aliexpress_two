"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Check, Eye } from "lucide-react";
import type { Product } from "@/lib/types/product";
import type { StoreInfo } from "@/lib/types/marketplace";
import { useCartStore } from "@/lib/store/cartStore";
import QuickViewModal from "@/components/shop/QuickViewModal";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
  store?: StoreInfo | null;
  productId?: string;
}

export default function ProductCard({
  product,
  viewMode = "grid",
  store,
  productId,
}: ProductCardProps) {
  // ── Existing state ─────────────────────────────────────────────────────────
  const [wished, setWished] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [btnScale, setBtnScale] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // ── Image hover / crossfade state ──────────────────────────────────────────
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Deduplicated image list: thumbnail first, then product.images
  const allImages = [product.thumbnail, ...(product.images ?? [])].filter(
    (img, index, self) => Boolean(img) && self.indexOf(img) === index
  );

  // Future-proof: detect if any source is a video
  const videoSrc = allImages.find(
    (src) => src?.endsWith(".mp4") || src?.endsWith(".webm")
  );

  // ── Cart store ─────────────────────────────────────────────────────────────
  const addItem = useCartStore((state) => state.addItem);
  const addMarketplaceItem = useCartStore((state) => state.addMarketplaceItem);
  const openCart = useCartStore((state) => state.openCart);
  const cartItems = useCartStore((state) => state.items);

  // Cart id: use real productId if from a store, otherwise "dummy-{id}"
  const cartId = productId ?? `dummy-${product.id}`;
  const cartItem = cartItems.find((item) => item.id === cartId);
  const inCart = !!cartItem;
  const cartQuantity = cartItem?.quantity ?? 0;

  const discountedPrice =
    product.discountPercentage > 0
      ? product.price * (1 - product.discountPercentage / 100)
      : null;

  const reviewCount = product.reviews?.length ?? 0;
  const displayReviewCount =
    reviewCount > 0
      ? reviewCount
      : (product.stock * 37 + product.id * 13) % 450 + 50;

  const fullStars = Math.floor(product.rating);
  const hasHalfStar = product.rating - fullStars >= 0.5;

  // ── Hover handlers ─────────────────────────────────────────────────────────
  const handleMouseEnter = () => {
    if (allImages.length <= 1) return;
    setIsHovered(true);

    // After 400 ms, advance to the second image
    initialTimerRef.current = setTimeout(() => {
      setCurrentImageIndex(1);

      // If 3+ images exist, cycle through the rest every 800 ms
      if (allImages.length >= 3) {
        hoverTimerRef.current = setInterval(() => {
          setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
        }, 800);
      }
    }, 400);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (initialTimerRef.current) {
      clearTimeout(initialTimerRef.current);
      initialTimerRef.current = null;
    }
    if (hoverTimerRef.current) {
      clearInterval(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setCurrentImageIndex(0);
  };

  // Mobile: tap cycles to the next image
  const handleImageTouchStart = () => {
    if (allImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (initialTimerRef.current) clearTimeout(initialTimerRef.current);
      if (hoverTimerRef.current) clearInterval(hoverTimerRef.current);
    };
  }, []);

  // ── Cart handler ──────────────────────────────────────────────────────────
  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (store && productId) {
      // Real store product — attach full store info
      addMarketplaceItem({
        id: productId,
        dummyProductId: product.id,
        title: product.title,
        price: product.price,
        discountPercentage: product.discountPercentage,
        thumbnail: product.thumbnail,
        brand: product.brand ?? "AliExpress",
        category: product.category,
        quantity: 1,
        storeId: store.id,
        storeName: store.storeName,
        storeSlug: store.storeSlug,
        storeLogoUrl: store.logoUrl,
        isVerifiedStore: store.isVerified,
      });
    } else {
      // DummyJSON fallback — no store
      addItem(product);
    }
    openCart();
    setCartAdded(true);
    setBtnScale(true);
    setTimeout(() => setBtnScale(false), 150);
    setTimeout(() => setCartAdded(false), 1500);
  };

  // ── Shared image-stack renderer (called as function, not component) ────────
  // Using a render-function pattern so React reconciles the output as plain JSX
  // (avoids remount that would occur with an inline sub-component declaration).
  const renderImageStack = (sizes: string) => (
    <>
      {allImages.map((img, index) => {
        if (!img) return null;
        const isVideoSrc = img?.endsWith(".mp4") || img?.endsWith(".webm");

        // Video layer (future-proof)
        if (isVideoSrc && videoSrc) {
          return (
            <video
              key={`${img}-${index}`}
              src={img}
              autoPlay
              muted
              loop
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                index === currentImageIndex && isHovered
                  ? "opacity-100"
                  : "opacity-0"
              }`}
            />
          );
        }

        // Image layer
        return (
          <Image
            key={`${img}-${index}`}
            src={img}
            alt={`${product.title} - image ${index + 1}`}
            width={500}
            height={500}
            className={`object-cover absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            sizes={sizes}
            priority={false}
          />
        );
      })}

      {/* Progress dots — visible only on hover when multiple images exist */}
      {/* <div
        className={`absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 transition-opacity duration-300 pointer-events-none ${
          isHovered && allImages.length > 1 ? "opacity-100" : "opacity-0"
        }`}
      >
        {allImages.map((_, index) => (
          <div
            key={index}
            className={`rounded-full transition-all duration-300 drop-shadow-sm ${
              index === currentImageIndex
                ? "w-4 h-1.5 bg-white"
                : "w-1.5 h-1.5 bg-white/60"
            }`}
          />
        ))}
      </div> */}
    </>
  );

  // ── LIST MODE ─────────────────────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <>
        <div
          className="relative bg-white rounded-lg hover:shadow-sm transition-shadow duration-200 border border-gray-100 flex gap-4 p-3 items-start"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Stretched link for list mode */}
          {productId && (
            <Link
              href={`/products/${productId}`}
              className="absolute inset-0 z-[2] rounded-xl"
              aria-label={product.title}
            />
          )}
          {/* Image — fixed size, static, crossfade only */}
          <div
            className="relative flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-lg overflow-hidden bg-gray-50"
            onTouchStart={handleImageTouchStart}
          >
            {renderImageStack("144px")}

            {/* Discount badge */}
            {product.discountPercentage > 0 && !inCart && (
              <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded z-10">
                -{Math.round(product.discountPercentage)}%
              </div>
            )}
            {/* In-cart badge */}
            {inCart && (
              <div className="absolute top-1.5 left-1.5 bg-[#E53935] text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center z-20 shadow">
                {cartQuantity}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            {/* Category + brand row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold text-[#E53935] bg-[#E53935]/10 rounded-full px-2 py-0.5">
                ✓ Verified Seller
              </span>
              {product.brand && (
                <span className="text-[10px] text-gray-400 capitalize">
                  {product.brand}
                </span>
              )}
              <span className="text-[10px] text-gray-400 capitalize hidden sm:inline">
                {product.category.replace(/-/g, " ")}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-[#1A1A1A] line-clamp-2 leading-snug">
              {product.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-gray-500 line-clamp-2 hidden sm:block leading-relaxed">
              {product.description}
            </p>

            {/* Rating */}
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
              <span className="text-[10px] text-gray-400">
                {product.rating.toFixed(1)} ({displayReviewCount})
              </span>
            </div>

            {/* Price + actions row */}
            <div className="flex items-center gap-3 flex-wrap mt-auto pt-1">
              {/* Price */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-[#1A1A1A]">
                  $
                  {discountedPrice
                    ? discountedPrice.toFixed(2)
                    : product.price.toFixed(2)}
                </span>
                {discountedPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Low stock */}
              {product.stock > 0 && product.stock <= 5 && (
                <span className="text-[10px] text-orange-500 font-semibold">
                  Only {product.stock} left
                </span>
              )}

              {/* Action buttons */}
              <div className="relative z-[5] flex items-center gap-2 ml-auto">
                {/* Quick View */}
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewOpen(true); }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-[#E53935] hover:text-[#E53935] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Quick View</span>
                </button>

                {/* Wishlist */}
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWished(!wished); }}
                  className="p-1.5 border border-gray-200 rounded-lg hover:border-red-300 hover:text-red-500 transition-colors"
                  aria-label="Toggle wishlist"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      wished ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                  />
                </button>

                {/* Add to cart */}
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(); }}
                  disabled={product.stock === 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    btnScale ? "scale-95" : "scale-100"
                  } ${
                    product.stock === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : cartAdded
                      ? "bg-green-600 text-white"
                      : inCart
                      ? "bg-[#E53935] text-white hover:bg-[#C62828]"
                      : "bg-[#E53935] text-white hover:bg-[#C62828]"
                  }`}
                >
                  {cartAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Added!
                    </>
                  ) : inCart ? (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add Another
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <QuickViewModal
          product={product}
          open={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
          store={store}
          productId={productId}
        />
      </>
    );
  }

  // ── GRID MODE ─────────────────────────────────────────────────────────────
  return (
    <>
      <div
        className="relative bg-white rounded-lg hover:shadow-sm transition-shadow duration-200 border border-gray-100 flex flex-col h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Stretched link — covers entire card, above non-interactive content */}
        {productId && (
          <Link
            href={`/products/${productId}`}
            className="absolute inset-0 z-[2] rounded-xl"
            aria-label={product.title}
          />
        )}

        {/* Image container — completely static size, no zoom */}
        <div
          className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-100"
          onTouchStart={handleImageTouchStart}
        >
          {renderImageStack(
            "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          )}

          {/* Discount Badge */}
          {product.discountPercentage > 0 && !inCart && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md z-10">
              -{Math.round(product.discountPercentage)}%
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWished(!wished); }}
            className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center transition-all duration-200 hover:scale-110 z-[5] ${
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

          {/* Quick View Button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewOpen(true); }}
            className={`absolute top-2 right-10 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center transition-all duration-200 hover:scale-110 z-[5] ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            aria-label="Quick view"
          >
            <Eye className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {/* Low Stock Badge */}
          {/* {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute bottom-8 left-2 bg-orange-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded z-10">
              Only {product.stock} left
            </div>
          )} */}

          {/* In-Cart Quantity Badge */}
          {inCart && (
            <div className="absolute top-2 left-2 bg-[#E53935] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center z-20 shadow">
              {cartQuantity}
            </div>
          )}

          {/* Add to Cart Overlay — slides up on hover */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(); }}
            className={`absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white transition-all duration-200 z-[5] ${
              isHovered ? "translate-y-0" : "translate-y-full"
            } ${btnScale ? "scale-95" : "scale-100"} ${
              cartAdded
                ? "bg-green-600"
                : inCart
                ? "bg-[#E53935] hover:bg-[#C62828]"
                : "bg-[#E53935] hover:bg-[#C62828]"
            }`}
          >
            {cartAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added!
              </>
            ) : inCart ? (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add Another
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart
              </>
            )}
          </button>
        </div>

        {/* Card Body */}
        <div className="p-3 flex flex-col gap-1.5 flex-1">
          {store?.isVerified && (
            <span className="text-[10px] font-semibold text-[#E53935] bg-[#E53935]/10 rounded-full px-2 py-0.5 w-fit leading-tight">
              ✓ Verified Seller
            </span>
          )}

          <h3 className="text-xs font-medium text-[#1A1A1A] line-clamp-2 leading-snug flex-1">
            {product.title}
          </h3>

          {/* Rating */}
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
            <span className="text-[10px] text-gray-400">
              {product.rating.toFixed(1)} ({displayReviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mt-auto pt-1">
            <span className="text-sm font-bold text-[#1A1A1A]">
              $
              {discountedPrice
                ? discountedPrice.toFixed(2)
                : product.price.toFixed(2)}
            </span>
            {discountedPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Store row — fades in on hover, shown only when store prop provided */}
          {store && (
            <div
              className={`flex items-center gap-1.5 pt-1 border-t border-gray-100 transition-opacity duration-150 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              {store.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  alt={store.storeName}
                  width={16}
                  height={16}
                  className="rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-[#E53935] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[6px] font-bold">
                    {store.storeName[0].toUpperCase()}
                  </span>
                </div>
              )}
              <Link
                href={`/store/${store.storeSlug}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/store/${store.storeSlug}`; }}
                className="relative z-[5] text-[10px] text-gray-500 hover:text-[#E53935] truncate max-w-[80px] transition-colors"
              >
                {store.storeName}
              </Link>
              {store.isVerified && (
                <span className="text-[9px] font-bold text-[#E53935] flex-shrink-0">
                  ✓
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <QuickViewModal
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-3 bg-gray-200 rounded-full w-1/2" />
        <div className="h-3.5 bg-gray-200 rounded w-full" />
        <div className="h-3.5 bg-gray-200 rounded w-3/4" />
        <div className="h-2.5 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/5 mt-1" />
      </div>
    </div>
  );
}
