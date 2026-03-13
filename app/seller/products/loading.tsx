import { Skeleton } from "@/components/ui/skeleton";

export default function SellerProductsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-72 mb-8" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
            <Skeleton className="h-8 w-12 mx-auto mb-2" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>

      {/* Wizard card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 p-6">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-3 w-64 mb-8" />
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-12 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="w-9 h-9 rounded-full" />
              <Skeleton className="h-2 w-14" />
            </div>
          ))}
        </div>
        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
