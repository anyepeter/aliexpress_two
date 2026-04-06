"use client";

import { useState, useEffect } from "react";
import { Tag, ChevronRight, ChevronDown, Loader2 } from "lucide-react";

interface CategoryData {
  slug: string;
  name: string;
  count: number;
  subcategories: { slug: string; name: string; count: number }[];
}

interface Step1CategoriesProps {
  selected: string[];
  selectedSubs: string[];
  onNext: (categories: string[], subcategories: string[]) => void;
}

export default function Step1Categories({ selected, selectedSubs, onNext }: Step1CategoriesProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickedCats, setPickedCats] = useState<Set<string>>(new Set(selected));
  const [pickedSubs, setPickedSubs] = useState<Set<string>>(new Set(selectedSubs));
  const [expandedCat, setExpandedCat] = useState<string | null>(selected[0] ?? null);

  useEffect(() => {
    fetch("/api/products/categories")
      .then((r) => r.json())
      .then((data: CategoryData[]) => {
        setCategories(data);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleCategory = (slug: string) => {
    setPickedCats((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
        // Also remove all subcategories under this category
        const cat = categories.find((c) => c.slug === slug);
        if (cat) {
          setPickedSubs((prevSubs) => {
            const nextSubs = new Set(prevSubs);
            cat.subcategories.forEach((s) => nextSubs.delete(s.slug));
            return nextSubs;
          });
        }
      } else {
        next.add(slug);
        setExpandedCat(slug);
      }
      return next;
    });
  };

  const toggleSubcategory = (catSlug: string, subSlug: string) => {
    // Ensure parent category is selected
    setPickedCats((prev) => {
      const next = new Set(prev);
      next.add(catSlug);
      return next;
    });
    setPickedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(subSlug)) next.delete(subSlug);
      else next.add(subSlug);
      return next;
    });
  };

  const toggleExpand = (slug: string) => {
    setExpandedCat(expandedCat === slug ? null : slug);
  };

  const totalSelected = pickedCats.size;

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-320px)]">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Choose Categories</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select the product categories you want to sell from. Click a category to expand its subcategories.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#E53935]" />
        </div>
      ) : (
        <>
          {/* Count */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-[#E53935]">{totalSelected}</span> categor{totalSelected === 1 ? "y" : "ies"} selected
              {pickedSubs.size > 0 && (
                <span className="text-gray-400"> &middot; {pickedSubs.size} subcategor{pickedSubs.size === 1 ? "y" : "ies"}</span>
              )}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPickedCats(new Set(categories.map((c) => c.slug)));
                }}
                className="text-xs text-[#E53935] font-medium hover:underline"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => { setPickedCats(new Set()); setPickedSubs(new Set()); }}
                className="text-xs text-gray-500 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Category list with expandable subcategories */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-1">
            {categories.map((cat) => {
              const isActive = pickedCats.has(cat.slug);
              const isExpanded = expandedCat === cat.slug;
              const hasSubs = cat.subcategories.length > 0;

              return (
                <div key={cat.slug}>
                  {/* Category row */}
                  <div className="flex items-center gap-1">
                    {/* Expand toggle */}
                    {hasSubs && (
                      <button
                        onClick={() => toggleExpand(cat.slug)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {!hasSubs && <div className="w-8" />}

                    {/* Category button */}
                    <button
                      onClick={() => toggleCategory(cat.slug)}
                      className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? "border-[#E53935] bg-[#E53935]/5 text-[#E53935]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Tag className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-[#E53935]" : "text-gray-400"}`} />
                      <span className="flex-1 text-left">{cat.name}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                        isActive ? "bg-[#E53935]/10 text-[#E53935]" : "bg-gray-100 text-gray-400"
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  </div>

                  {/* Subcategories (expanded) */}
                  {hasSubs && isExpanded && (
                    <div className="ml-10 mt-1 mb-2 pl-3 border-l-2 border-gray-100 space-y-1">
                      {cat.subcategories.map((sub) => {
                        const subActive = pickedSubs.has(sub.slug);
                        return (
                          <button
                            key={sub.slug}
                            onClick={() => toggleSubcategory(cat.slug, sub.slug)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              subActive
                                ? "bg-[#E53935]/5 text-[#E53935] border border-[#E53935]/30"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent"
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              subActive ? "bg-[#E53935]" : "bg-gray-300"
                            }`} />
                            <span className="flex-1 text-left">{sub.name}</span>
                            <span className="text-[10px] text-gray-400">{sub.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Next */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => onNext(Array.from(pickedCats), Array.from(pickedSubs))}
          disabled={pickedCats.size === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#E53935] text-white rounded-xl font-semibold text-sm hover:bg-[#C62828] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next: Browse Products
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
