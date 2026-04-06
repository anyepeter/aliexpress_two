"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Check, Sparkles, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";

interface SponsoredProduct {
  id: string;
  dummyProductId: number;
  title: string;
  thumbnail: string;
  sellingPrice: number;
  rating: number;
  discountPercentage: number;
  brand: string;
  category: string;
  description: string;
  stock: number;
  images: string[];
  store: {
    storeName: string;
    storeSlug: string;
    logoUrl: string | null;
    isVerified: boolean;
  };
  planTier: string;
}

export default function SponsoredProducts() {
  const [products, setProducts] = useState<SponsoredProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products/sponsored?limit=6")
      .then((r) => r.ok ? r.json() : { products: [] })
      .then((data) => setProducts(data.products ?? data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || products.length === 0) return null;

  const handleAddToCart = (p: SponsoredProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: p.dummyProductId,
      title: p.title,
      price: p.sellingPrice,
      discountPercentage: p.discountPercentage,
      thumbnail: p.thumbnail,
      brand: p.brand,
      category: p.category,
      description: p.description,
      stock: p.stock,
      rating: p.rating,
      images: p.images,
    });
    openCart();
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="w-5 h-5 text-[#E53935]" />
        <h2
          className="text-2xl md:text-3xl font-black text-[#1A1A1A]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Sponsored Stores
        </h2>
        <span className="text-xs text-gray-400 ml-2">AD</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {products.slice(0, 6).map((product) => {
          const discountedPrice = product.discountPercentage > 0
            ? product.sellingPrice * (1 - product.discountPercentage / 100)
            : product.sellingPrice;
          const isAdded = addedId === product.id;

          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                {product.discountPercentage > 0 && (
                  <span className="absolute top-2 left-2 bg-[#E53935] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    -{Math.round(product.discountPercentage)}%
                  </span>
                )}
                {/* Sponsored badge */}
                <span className="absolute top-2 right-2 bg-black/50 text-white text-[9px] font-medium px-1.5 py-0.5 rounded backdrop-blur-sm">
                  Sponsored
                </span>
                {/* Add to Cart on hover */}
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1 py-2 bg-[#E53935] text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 hover:bg-[#C62828]"
                >
                  {isAdded ? (
                    <><Check className="w-3 h-3" /> Added!</>
                  ) : (
                    <><ShoppingCart className="w-3 h-3" /> Add to Cart</>
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-xs text-gray-700 line-clamp-2 leading-snug mb-1.5 min-h-[2.25rem]">
                  {product.title}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-1.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= Math.round(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">{product.rating.toFixed(1)}</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-extrabold text-[#1A1A1A]">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  {product.discountPercentage > 0 && (
                    <span className="text-[11px] text-gray-400 line-through">
                      ${product.sellingPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Store */}
                <div className="flex items-center gap-1 mt-1.5">
                  {product.store.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.store.logoUrl} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-gray-200" />
                  )}
                  <span className="text-[10px] text-gray-400 truncate">{product.store.storeName}</span>
                  {product.store.isVerified && (
                    <span className="text-[8px] text-[#E53935]">✓</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* See More */}
      <div className="flex justify-center mt-6">
        <Link
          href="/sponsored"
          className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-full hover:border-gray-400 hover:text-gray-900 transition-all text-sm"
        >
          See All Sponsored Stores
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
