"use client";

import MessageButton from "@/components/messages/MessageButton";

interface StoreSidebarProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
  productCount: number;
  storeName: string;
  memberSince: string;
  storeUserId?: string;
}

export default function StoreSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  productCount,
  storeName,
  memberSince,
  storeUserId,
}: StoreSidebarProps) {
  return (
    <aside className="w-full lg:w-56 flex-shrink-0">
      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Store Stats
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Products</span>
            <span className="text-xs font-bold text-[#1A1A1A]">
              {productCount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Member since</span>
            <span className="text-xs font-bold text-[#1A1A1A]">
              {new Date(memberSince).getFullYear()}
            </span>
          </div>
        </div>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Categories
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => onCategoryChange(null)}
              className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors ${
                selectedCategory === null
                  ? "bg-[#E53935] text-white font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  onCategoryChange(cat === selectedCategory ? null : cat)
                }
                className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors capitalize ${
                  selectedCategory === cat
                    ? "bg-[#E53935] text-white font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat.replace(/-/g, " ")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contact links */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mt-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Store
        </h3>
        <div className="space-y-2">
          {storeUserId && (
            <MessageButton
              targetUserId={storeUserId}
              subject={`Question about store: ${storeName}`}
              label={`Contact ${storeName}`}
              variant="secondary"
            />
          )}
          <button className="w-full text-left text-xs px-2 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
            Report Store
          </button>
        </div>
      </div>
    </aside>
  );
}
