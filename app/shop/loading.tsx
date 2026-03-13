import Navbar from "@/components/layout/Navbar";
import { ProductCardSkeleton } from "@/components/home/ProductCard";

export default function ShopLoading() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F6FA]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar skeleton */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl p-5 animate-pulse">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="mb-6">
                    <div className="h-3.5 bg-gray-200 rounded w-1/2 mb-3" />
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div
                        key={j}
                        className="h-2.5 bg-gray-100 rounded w-3/4 mb-2.5"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </aside>

            {/* Main content skeleton */}
            <div className="flex-1 min-w-0">
              <div className="h-24 bg-white rounded-xl animate-pulse mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
