import Image from "next/image";
import type { StoreInfo } from "@/lib/types/marketplace";

interface StoreBannerProps {
  store: StoreInfo;
  productCount: number;
}

export default function StoreBanner({ store, productCount }: StoreBannerProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-100">
      {/* Banner */}
      <div className="relative h-[140px] sm:h-[180px] bg-gradient-to-r from-[#E53935] to-[#2a5c8e]">
        {store.bannerUrl && (
          <Image
            src={store.bannerUrl}
            alt={`${store.storeName} banner`}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Store identity row */}
      <div className="bg-white px-5 py-4 flex items-end gap-4">
        {/* Logo — overlaps banner */}
        <div className="relative -mt-12 flex-shrink-0">
          {store.logoUrl ? (
            <Image
              src={store.logoUrl}
              alt={store.storeName}
              width={80}
              height={80}
              className="rounded-xl object-cover ring-4 ring-white shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-[#E53935] flex items-center justify-center ring-4 ring-white shadow-md">
              <span className="text-white text-3xl font-bold">
                {store.storeName[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0 pb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-[#1A1A1A] leading-tight">
              {store.storeName}
            </h1>
            {store.isVerified && (
              <span className="text-[10px] font-bold text-[#E53935] bg-[#E53935]/10 rounded-full px-2 py-0.5 flex-shrink-0">
                ✓ Verified Seller
              </span>
            )}
          </div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => {
                const rating = store.ratingOverride ?? store.averageRating ?? 0;
                return (
                  <svg key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                );
              })}
            </div>
            <span className="text-sm font-bold text-[#1A1A1A]">{(store.ratingOverride ?? store.averageRating ?? 0).toFixed(1)}</span>
            {store.totalReviews > 0 && (
              <span className="text-xs text-gray-400">({store.totalReviews} review{store.totalReviews !== 1 ? "s" : ""})</span>
            )}
          </div>
          {store.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {store.description}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            {productCount} product{productCount !== 1 ? "s" : ""} &bull; Member
            since {new Date(store.createdAt).getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
