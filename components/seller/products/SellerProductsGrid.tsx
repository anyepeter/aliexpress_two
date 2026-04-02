"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Star, Package, TrendingUp, Trash2, Pencil, Check, X, Loader2, AlertTriangle } from "lucide-react";
import type { SavedSellerProduct } from "@/lib/types/sellerProduct";

interface SellerProductsGridProps {
  products: SavedSellerProduct[];
  onDelete?: (id: string) => void;
}

const EDIT_MIN = 10;
const EDIT_MAX = 15;

const statusColors: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

// ── Individual card with image hover cycling ──────────────────────────────────
function SellerProductCard({
  product,
  onDelete,
  onMarginSaved,
}: {
  product: SavedSellerProduct;
  onDelete?: (id: string) => void;
  onMarginSaved?: (id: string, marginPercent: number, sellingPrice: number) => void;
}) {
  const images = (product.images as string[]).filter(Boolean);
  const allImages = [...new Set([images[0], ...images].filter(Boolean))];
  const hasDiscount = product.discountPct > 0;
  const discountedSelling = hasDiscount
    ? product.sellingPrice * (1 - product.discountPct / 100)
    : product.sellingPrice;
  const discountedBase = hasDiscount
    ? product.basePrice * (1 - product.discountPct / 100)
    : product.basePrice;
  const profit = discountedSelling - discountedBase;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const initialTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Margin editing
  const [isEditing, setIsEditing] = useState(false);
  const [editMargin, setEditMargin] = useState(product.marginPercent);
  const [isSaving, setIsSaving] = useState(false);
  const editSellingPrice = product.basePrice * (1 + editMargin / 100);
  const editProfit = editSellingPrice - product.basePrice;

  const handleSaveMargin = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/seller/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marginPercent: editMargin }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      onMarginSaved?.(product.id, editMargin, data.product.sellingPrice);
      setIsEditing(false);
    } catch {
      // keep editing open on error
    } finally {
      setIsSaving(false);
    }
  };

  const stopCycling = () => {
    if (initialTimer.current) { clearTimeout(initialTimer.current); initialTimer.current = null; }
    if (cycleTimer.current) { clearInterval(cycleTimer.current); cycleTimer.current = null; }
  };

  const handleMouseEnter = () => {
    if (allImages.length <= 1 || isEditing) return;
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
    if (allImages.length <= 1 || isEditing) return;
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  useEffect(() => {
    if (isEditing) {
      stopCycling();
      setCurrentIndex(0);
      setIsHovered(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  useEffect(() => {
    return () => stopCycling();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image */}
      <div
        className="relative aspect-square bg-gray-50 overflow-hidden"
        onTouchStart={handleTouchStart}
      >
        {allImages.map((src, idx) => (
          <Image
            key={src}
            src={src}
            alt={`${product.title} - ${idx + 1}`}
            fill
            className={`object-contain p-2 absolute inset-0 transition-opacity duration-500 ease-in-out ${
              idx === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            priority={idx === 0}
          />
        ))}

        {/* Progress dots on hover */}
        {allImages.length > 1 && (
          <div className={`absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 pointer-events-none transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
            {allImages.map((_, idx) => (
              <div
                key={idx}
                className={`rounded-full transition-all duration-300 drop-shadow-sm ${
                  idx === currentIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}

        {/* Status badge */}
        {product.status !== "PUBLISHED" && (
          <span className={`absolute top-2 left-2 z-10 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusColors[product.status] ?? "bg-gray-100 text-gray-500"}`}>
            {product.status}
          </span>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-2 right-2 z-10 text-[10px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded-md">
            -{Math.round(product.discountPct)}%
          </span>
        )}

        {/* Action overlay (edit margin + delete) */}
        {!isEditing && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 z-20">
            {onMarginSaved && (
              <button
                onClick={(e) => { e.stopPropagation(); setEditMargin(product.marginPercent); setIsEditing(true); }}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-50 transition-colors"
                title="Edit margin"
              >
                <Pencil className="w-3.5 h-3.5 text-[#E53935]" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                title="Remove product"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-semibold text-[#1A1A1A] line-clamp-2 leading-snug mb-2">
          {product.title}
        </p>

        {isEditing ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500">
                Base: <span className="font-medium">${product.basePrice.toFixed(2)}</span>
              </span>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs font-bold text-[#1A1A1A]">{editMargin.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] text-gray-400 w-6 text-right flex-shrink-0">{EDIT_MIN}%</span>
              <input
                type="range"
                min={EDIT_MIN}
                max={EDIT_MAX}
                step={0.5}
                value={editMargin}
                onChange={(e) => setEditMargin(Number(e.target.value))}
                className="flex-1 h-1.5 accent-[#E53935] cursor-pointer"
              />
              <span className="text-[10px] text-gray-400 w-6 flex-shrink-0">{EDIT_MAX}%</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1A1A1A]">${editSellingPrice.toFixed(2)}</span>
              <span className="text-[10px] text-green-600 font-medium">+${editProfit.toFixed(2)}</span>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={handleSaveMargin}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#E53935] text-white text-[11px] font-semibold rounded-lg hover:bg-[#C62828] transition-colors disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-gray-200 text-gray-500 text-[11px] font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-[#1A1A1A]">
                  ${discountedSelling.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-[10px] text-gray-400 line-through">
                    ${product.sellingPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {product.rating && (
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-[#E53935] fill-[#E53935]" />
                  <span className="text-[10px] text-gray-500">{product.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-green-600 font-medium">
                +${profit.toFixed(2)} ({product.marginPercent.toFixed(0)}%)
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────────
export default function SellerProductsGrid({ products, onDelete }: SellerProductsGridProps) {
  const [localProducts, setLocalProducts] = useState<SavedSellerProduct[]>(products);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

  const handleMarginSaved = (id: string, marginPercent: number, sellingPrice: number) => {
    setLocalProducts((prev) =>
      prev.map((p) => p.id === id ? { ...p, marginPercent, sellingPrice } : p)
    );
  };

  // Show confirmation modal instead of deleting immediately
  const requestDelete = (id: string) => {
    const product = localProducts.find((p) => p.id === id);
    if (product) setConfirmDelete({ id, title: product.title });
  };

  // Actually delete after confirmation
  const confirmAndDelete = () => {
    if (!confirmDelete) return;
    setLocalProducts((prev) => prev.filter((p) => p.id !== confirmDelete.id));
    onDelete?.(confirmDelete.id);
    setConfirmDelete(null);
  };

  if (localProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No products yet.</p>
        <p className="text-gray-300 text-xs mt-1">Use the wizard to add products to your store.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {localProducts.map((product) => (
          <SellerProductCard
            key={product.id}
            product={product}
            onDelete={onDelete ? requestDelete : undefined}
            onMarginSaved={handleMarginSaved}
          />
        ))}
      </div>

      {/* ── Delete confirmation modal ───────────────────────────────────── */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>

            {/* Text */}
            <h3 className="text-base font-bold text-center text-[#1A1A1A] mb-2">
              Remove Product?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              This will remove
            </p>
            <p className="text-sm font-semibold text-center text-[#1A1A1A] mb-5 line-clamp-2 px-2">
              &ldquo;{confirmDelete.title}&rdquo;
            </p>
            <p className="text-xs text-gray-400 text-center -mt-3 mb-5">
              from your store. This cannot be undone.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndDelete}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
