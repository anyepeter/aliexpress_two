"use client";

import { useState } from "react";
import { Star, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import type { MarketplaceProduct } from "@/lib/types/marketplace";
import { useCartStore } from "@/lib/store/cartStore";

interface ProductInfoProps {
  product: MarketplaceProduct;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [descExpanded, setDescExpanded] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const addMarketplaceItem = useCartStore((s) => s.addMarketplaceItem);
  const openCart = useCartStore((s) => s.openCart);

  const fullStars = Math.floor(product.rating);
  const hasHalf = product.rating - fullStars >= 0.5;

  const handleAddToCart = () => {
    addMarketplaceItem({
      id: product.id,
      dummyProductId: product.dummyProductId,
      title: product.title,
      price: product.sellingPrice,
      discountPercentage: product.discountPercentage,
      thumbnail: product.thumbnail,
      brand: product.brand,
      category: product.category,
      quantity,
      storeId: product.store?.id ?? null,
      storeName: product.store?.storeName ?? null,
      storeSlug: product.store?.storeSlug ?? null,
      storeLogoUrl: product.store?.logoUrl ?? null,
      isVerifiedStore: product.store?.isVerified ?? false,
    });
    openCart();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const inStock = product.stock > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Category + verified badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 capitalize">
          {product.category.replace(/-/g, " ")}
        </span>
        {product.isPremium && (
          <span className="text-[10px] font-bold text-[#1A1A1A] bg-[#E53935]/10 rounded-full px-2 py-0.5">
            ✓ Verified Seller
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-[#1A1A1A] leading-snug">
        {product.title}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < fullStars
                  ? "fill-[#E53935] text-[#E53935]"
                  : i === fullStars && hasHalf
                  ? "fill-[#E53935]/50 text-[#E53935]"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">{product.rating.toFixed(1)}</span>
      </div>

      {/* Price */}
      {(() => {
        const hasDiscount = product.discountPercentage > 0;
        const discountedPrice = hasDiscount
          ? product.sellingPrice * (1 - product.discountPercentage / 100)
          : null;
        return (
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-bold text-[#1A1A1A]">
              ${(discountedPrice ?? product.sellingPrice).toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ${product.sellingPrice.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-red-500 bg-red-50 rounded-full px-2 py-0.5">
                  -{Math.round(product.discountPercentage)}% OFF
                </span>
              </>
            )}
          </div>
        );
      })()}

      {/* Stock badge */}
      {inStock ? (
        <p className="text-sm font-medium text-green-600">
          {product.stock <= 5
            ? `Only ${product.stock} left in stock — order soon`
            : "In Stock"}
        </p>
      ) : (
        <p className="text-sm font-medium text-red-500">Out of Stock</p>
      )}

      {/* Brand */}
      {product.brand && (
        <p className="text-sm text-gray-500">
          Brand: <span className="font-medium text-[#1A1A1A]">{product.brand}</span>
        </p>
      )}

      {/* Key Features */}
      {product.keyFeatures && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-[#1A1A1A] mb-2">Key Features</h3>
          <ul className="space-y-1.5">
            {product.keyFeatures.split("\n").filter(Boolean).slice(0, 7).map((line, i) => {
              const bracketMatch = line.match(/【([^】]+)】\s*(.*)/);
              const cleaned = line.replace(/^•\s*/, "").replace(/^[-–]\s*/, "");
              return (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-[#E53935] mt-0.5 flex-shrink-0">✓</span>
                  {bracketMatch ? (
                    <span>
                      <strong className="text-[#1A1A1A]">{bracketMatch[1]}</strong>
                      {bracketMatch[2] ? ` - ${bracketMatch[2]}` : ""}
                    </span>
                  ) : (
                    <span>{cleaned}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Description */}
      <div>
        <p
          className={`text-sm text-gray-600 leading-relaxed whitespace-pre-line ${
            descExpanded ? "" : "line-clamp-3"
          }`}
        >
          {product.description}
        </p>
        <button
          onClick={() => setDescExpanded((v) => !v)}
          className="mt-1 flex items-center gap-1 text-xs text-[#E53935] font-medium hover:text-[#E53935] transition-colors"
        >
          {descExpanded ? (
            <>
              Show less <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              Show more <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      </div>

      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Qty:</span>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="px-4 py-2 text-sm font-semibold text-[#1A1A1A] border-x border-gray-200 min-w-[40px] text-center">
            {quantity}
          </span>
          <button
            onClick={() =>
              setQuantity((q) => Math.min(q + 1, product.stock || 99))
            }
            className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={handleAddToCart}
        disabled={!inStock}
        className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
          !inStock
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : addedToCart
            ? "bg-green-600 text-white"
            : "bg-[#E53935] text-white hover:bg-[#C62828]"
        }`}
      >
        <ShoppingCart className="w-4 h-4" />
        {addedToCart ? "Added to Cart!" : "Add to Cart"}
      </button>
    </div>
  );
}
