"use client";

import { useState, useEffect } from "react";
import { Tag, ChevronRight, Loader2 } from "lucide-react";

interface Step1CategoriesProps {
  selected: string[];
  onNext: (categories: string[]) => void;
}

export default function Step1Categories({ selected, onNext }: Step1CategoriesProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<Set<string>>(new Set(selected));

  useEffect(() => {
    fetch("/api/products/categories")
      .then((r) => r.json())
      .then((data: Array<{ slug: string; name: string } | string>) => {
        const slugs = data.map((c) => (typeof c === "string" ? c : c.slug));
        setCategories(slugs);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (slug: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectAll = () => setPicked(new Set(categories));
  const clearAll = () => setPicked(new Set());

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Choose Categories</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select the product categories you want to sell from. You can pick multiple.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#E53935]" />
        </div>
      ) : (
        <>
          {/* Select all / clear */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-[#E53935]">{picked.size}</span> of{" "}
              {categories.length} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-xs text-[#E53935] font-medium hover:underline"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={clearAll}
                className="text-xs text-gray-500 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Category grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
            {categories.map((slug) => {
              const active = picked.has(slug);
              return (
                <button
                  key={slug}
                  onClick={() => toggle(slug)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-150 capitalize ${
                    active
                      ? "border-[#E53935] bg-[#E53935]/5 text-[#E53935]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Tag className={`w-3.5 h-3.5 flex-shrink-0 ${active ? "text-[#E53935]" : "text-gray-400"}`} />
                  <span className="truncate">{slug.replace(/-/g, " ")}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Next */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => onNext(Array.from(picked))}
          disabled={picked.size === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#E53935] text-white rounded-xl font-semibold text-sm hover:bg-[#C62828] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next: Browse Products
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
