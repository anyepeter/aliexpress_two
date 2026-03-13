export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image gallery skeleton */}
          <div className="flex flex-col gap-3">
            <div className="aspect-square rounded-2xl bg-gray-200 animate-pulse" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-16 h-16 rounded-lg bg-gray-200 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Product info skeleton */}
          <div className="flex flex-col gap-4">
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-7 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-7 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-3 mt-4">
              <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
            {/* Store card skeleton */}
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <div className="h-20 bg-gray-200 animate-pulse" />
              <div className="p-4 flex gap-3 bg-white">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse -mt-6" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
