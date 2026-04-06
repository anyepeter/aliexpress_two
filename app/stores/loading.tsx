import { StoreCardSkeleton } from "@/components/store/StoreCard";

export default function StoresLoading() {
  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        {/* Breadcrumb skeleton */}
        <div className="h-3 bg-gray-200 rounded w-24 mb-6 animate-pulse" />

        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-7 bg-gray-200 rounded w-40 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-56 animate-pulse" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <StoreCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
