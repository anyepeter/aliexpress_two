import Image from "next/image";
import Link from "next/link";
import { MapPin, Package, BadgeCheck, Star } from "lucide-react";
import type { StoreInfo } from "@/lib/types/marketplace";

interface StoreCardProps {
  store: StoreInfo & { productCount: number };
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link
      href={`/store/${store.storeSlug}`}
      className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Banner */}
      <div className="relative h-24 bg-gradient-to-r from-[#E53935] to-[#2a5c8e]">
        {store.bannerUrl && (
          <Image
            src={store.bannerUrl}
            alt={`${store.storeName} banner`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />

        {/* Verified badge on banner */}
        {store.isVerified && (
          <div className="absolute top-2 right-2 bg-[#E53935] text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <BadgeCheck className="w-3 h-3" />
            Verified
          </div>
        )}
      </div>

      {/* Logo overlaps banner */}
      <div className="px-4">
        <div className="relative -mt-8 w-16 h-16 flex-shrink-0">
          {store.logoUrl ? (
            <Image
              src={store.logoUrl}
              alt={store.storeName}
              width={64}
              height={64}
              className="rounded-xl object-cover ring-3 ring-white shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-[#E53935] flex items-center justify-center ring-3 ring-white shadow-md">
              <span className="text-white text-2xl font-bold">
                {store.storeName[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-2 pb-4 flex flex-col gap-2 flex-1">
        <h3 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#E53935] transition-colors leading-tight">
          {store.storeName}
        </h3>

        {/* Rating */}
        {(store.ratingOverride ?? store.averageRating) ? (
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${s <= Math.round(store.ratingOverride ?? store.averageRating ?? 0) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-gray-700">{(store.ratingOverride ?? store.averageRating)?.toFixed(1)}</span>
            <span className="text-[10px] text-gray-400">({store.totalReviews})</span>
          </div>
        ) : null}

        {store.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {store.description}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-auto pt-2 border-t border-gray-50 flex flex-col gap-1.5">
          {(store.city || store.country) && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {[store.city, store.country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Package className="w-3 h-3 flex-shrink-0" />
            <span>{store.productCount} product{store.productCount !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-[11px] text-gray-400">
            Member since {new Date(store.createdAt).getFullYear()}
          </p>
        </div>

        {/* CTA */}
        <div className="mt-2">
          <span className="inline-flex items-center text-xs font-semibold text-[#E53935] group-hover:text-[#E53935] transition-colors">
            Visit Store →
          </span>
        </div>
      </div>
    </Link>
  );
}

export function StoreCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-24 bg-gray-200" />
      <div className="px-4 -mt-8">
        <div className="w-16 h-16 rounded-xl bg-gray-300 ring-3 ring-white" />
      </div>
      <div className="px-4 pt-2 pb-4 flex flex-col gap-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="mt-auto pt-2 border-t border-gray-50">
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}
