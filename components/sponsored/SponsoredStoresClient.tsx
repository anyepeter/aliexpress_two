"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  Sparkles,
  Star,
  Eye,
  ShoppingBag,
  MapPin,
  BadgeCheck,
  Crown,
  Zap,
} from "lucide-react";

interface SponsoredProduct {
  id: string;
  title: string;
  thumbnail: string;
  sellingPrice: number;
  discountPercentage: number;
  rating: number;
}

interface SponsoredStore {
  id: string;
  storeName: string;
  storeSlug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  isVerified: boolean;
  country: string | null;
  city: string | null;
  rating: number | null;
  totalReviews: number;
  totalViews: number;
  totalOrders: number;
  productCount: number;
  plan: { name: string; tier: string };
  endDate: string | null;
  products: SponsoredProduct[];
}

const TIER_BADGE: Record<string, { icon: typeof Star; bg: string; text: string }> = {
  BASIC: { icon: Star, bg: "bg-gray-100", text: "text-gray-700" },
  STANDARD: { icon: Zap, bg: "bg-gray-100", text: "text-gray-700" },
  PREMIUM: { icon: Crown, bg: "bg-[#0F2540]/10", text: "text-[#0F2540]" },
};

function formatViews(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function SponsoredStoresClient() {
  const [stores, setStores] = useState<SponsoredStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sponsored-stores")
      .then((r) => r.ok ? r.json() : [])
      .then(setStores)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-20">
        <Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-400">No Sponsored Stores</h2>
        <p className="text-sm text-gray-400 mt-1">Check back later for promoted stores and deals.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-[#E53935]" />
          <h1
            className="text-2xl md:text-3xl font-black text-[#1A1A1A]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Sponsored Stores
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Discover promoted stores and their best products
        </p>
      </div>

      {/* Store Cards */}
      <div className="space-y-6">
        {stores.map((store) => {
          const tierConfig = TIER_BADGE[store.plan.tier] ?? TIER_BADGE.BASIC;
          const TierIcon = tierConfig.icon;

          return (
            <div
              key={store.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Banner */}
              <div className="relative h-32 bg-gradient-to-r from-[#E53935] to-[#2a5c8e]">
                {store.bannerUrl && (
                  <Image
                    src={store.bannerUrl}
                    alt={`${store.storeName} banner`}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                )}
                <div className="absolute inset-0 bg-black/10" />

                {/* Plan badge */}
                <div className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${tierConfig.bg} ${tierConfig.text}`}>
                  <TierIcon className="w-3 h-3" />
                  {store.plan.name}
                </div>

                {/* Sponsored tag */}
                <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded">
                  Sponsored
                </div>
              </div>

              {/* Store Info */}
              <div className="px-5 pt-0 pb-5">
                <div className="flex items-end gap-4 -mt-8 mb-3">
                  {/* Logo */}
                  {store.logoUrl ? (
                    <Image
                      src={store.logoUrl}
                      alt={store.storeName}
                      width={64}
                      height={64}
                      className="rounded-xl object-cover ring-4 ring-white shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#E53935] flex items-center justify-center ring-4 ring-white shadow-md">
                      <span className="text-white text-2xl font-bold">
                        {store.storeName[0].toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-[#1A1A1A]">{store.storeName}</h2>
                      {store.isVerified && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#E53935] bg-[#E53935]/10 rounded-full px-2 py-0.5">
                          <BadgeCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    {store.rating ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= Math.round(store.rating!) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-gray-700">{store.rating.toFixed(1)}</span>
                        {store.totalReviews > 0 && (
                          <span className="text-[10px] text-gray-400">({store.totalReviews})</span>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-[11px] text-gray-400 pb-1 shrink-0">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {formatViews(store.totalViews)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" /> {store.totalOrders} orders
                    </span>
                    {(store.city || store.country) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {[store.city, store.country].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                {store.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">{store.description}</p>
                )}

                {/* Products Row */}
                {store.products.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {store.products.map((product) => {
                      const discounted = product.discountPercentage > 0
                        ? product.sellingPrice * (1 - product.discountPercentage / 100)
                        : product.sellingPrice;

                      return (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
                        >
                          <div className="relative aspect-square">
                            <Image
                              src={product.thumbnail}
                              alt={product.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="150px"
                            />
                            {product.discountPercentage > 0 && (
                              <span className="absolute top-1.5 left-1.5 bg-[#E53935] text-white text-[9px] font-bold px-1 py-0.5 rounded">
                                -{Math.round(product.discountPercentage)}%
                              </span>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-[11px] text-gray-700 line-clamp-1">{product.title}</p>
                            <p className="text-xs font-bold text-[#1A1A1A] mt-0.5">${discounted.toFixed(2)}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Visit Store */}
                <Link
                  href={`/store/${store.storeSlug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E53935] hover:text-[#C62828] transition-colors"
                >
                  Visit Store →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
