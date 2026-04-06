export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-6" />

        {/* Banner skeleton */}
        <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-8">
          <div className="h-[140px] sm:h-[180px] bg-gray-200 animate-pulse" />
          <div className="bg-white px-5 py-4 flex items-end gap-4">
            <div className="w-20 h-20 -mt-10 rounded-xl bg-gray-300 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2 pb-1">
              <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="flex gap-6">
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="h-32 bg-white rounded-xl border border-gray-100 animate-pulse mb-4" />
            <div className="h-48 bg-white rounded-xl border border-gray-100 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-2.5 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
