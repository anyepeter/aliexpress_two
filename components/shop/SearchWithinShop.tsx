"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useShopStore } from "@/lib/store/shopStore";

export default function SearchWithinShop() {
  const searchQuery = useShopStore((s) => s.filters.searchQuery);
  const setFilter = useShopStore((s) => s.setFilter);
  const [local, setLocal] = useState(searchQuery);

  // Sync from store (URL init or external clear)
  useEffect(() => {
    setLocal(searchQuery);
  }, [searchQuery]);

  // Debounced update to store
  useEffect(() => {
    const timer = setTimeout(() => {
      if (local !== searchQuery) {
        setFilter("searchQuery", local);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [local]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Search within results..."
        className="pl-9 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#E53935] w-48 lg:w-64 bg-white"
      />
      {local && (
        <button
          onClick={() => {
            setLocal("");
            setFilter("searchQuery", "");
          }}
          className="absolute right-2.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
