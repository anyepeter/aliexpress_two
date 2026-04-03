"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  Sparkles,
  Star,
  ShoppingCart,
  Check,
  SlidersHorizontal,
} from "lucide-react";
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

type SortOption = "relevance" | "price-asc" | "price-desc" | "rating";

export default function SponsoredStoresClient() {
  const [products, setProducts] = useState<SponsoredProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [addedId, setAddedId] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    fetch("/api/products/sponsored")
      .then((r) => r.ok ? r.json() : { products: [], categories: [] })
      .then((data) => {
        setProducts(data.products ?? []);
        setCategories(data.categories ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Client-side filtering and sorting
  const filtered = useMemo(() => {
    let result = selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

    if (sort === "price-asc") result = [...result].sort((a, b) => a.sellingPrice - b.sellingPrice);
    else if (sort === "price-desc") result = [...result].sort((a, b) => b.sellingPrice - a.sellingPrice);
    else if (sort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);

    return result;
  }, [products, selectedCategory, sort]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-400">No Sponsored Products</h2>
        <p className="text-sm text-gray-400 mt-1">Check back later for promoted products and deals.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-[#E53935]" />
          <h1
            className="text-2xl md:text-3xl font-black text-[#1A1A1A]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Sponsored Products
          </h1>
          <span className="text-xs text-gray-400 ml-1">AD</span>
        </div>
        <p className="text-sm text-gray-500">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""} from promoted stores
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "all" ? "bg-[#1A1A1A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap capitalize transition-colors ${
                selectedCategory === cat ? "bg-[#1A1A1A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.replace(/-/g, " ")}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">No products in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((product) => {
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
                  <span className="absolute top-2 right-2 bg-black/40 text-white text-[9px] font-medium px-1.5 py-0.5 rounded backdrop-blur-sm">
                    Sponsored
                  </span>
                  {/* Add to Cart on hover */}
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1 py-2 bg-[#1A1A1A] text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 hover:bg-[#333]"
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
                      <span className="text-[8px] text-green-600">✓</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
