import Image from "next/image";
import { MapPin, ShieldCheck, Package, Globe } from "lucide-react";

interface StoreHeaderProps {
  storeName: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  country: string;
  city: string;
  isVerified: boolean;
  ownerName: string;
  productCount: number;
  websiteUrl?: string | null;
}

export default function StoreHeader({
  storeName,
  description,
  logoUrl,
  bannerUrl,
  country,
  city,
  isVerified,
  ownerName,
  productCount,
  websiteUrl,
}: StoreHeaderProps) {
  return (
    <div>
      {/* Banner */}
      <div className="relative h-44 md:h-56 w-full bg-gradient-to-br from-[#E53935] to-[#1A1A1A] overflow-hidden">
        {bannerUrl && (
          <Image
            src={bannerUrl}
            alt={`${storeName} banner`}
            fill
            className="object-cover"
            priority
          />
        )}
        {/* Subtle dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Info bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-4">
            {/* Logo — pulled up to overlap the banner */}
            <div className="-mt-10 flex-shrink-0 relative z-10">
              {logoUrl ? (
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                  <Image src={logoUrl} alt={storeName} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg bg-[#E53935] flex items-center justify-center text-white text-2xl font-bold select-none">
                  {storeName[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Store details */}
            <div className="flex-1 min-w-0 pt-3 pb-5">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-[#1A1A1A] leading-tight">
                  {storeName}
                </h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              {description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-2 max-w-xl">
                  {description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {city}, {country}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3 flex-shrink-0" />
                  {productCount} product{productCount !== 1 ? "s" : ""}
                </span>
                <span className="text-gray-400">by {ownerName}</span>
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#E53935] hover:underline"
                  >
                    <Globe className="w-3 h-3" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
