import Image from "next/image";
import type { StoreInfo } from "@/lib/types/marketplace";

interface StoreBannerProps {
  store: StoreInfo;
  productCount: number;
}

export default function StoreBanner({ store, productCount }: StoreBannerProps) {
  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100">
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
