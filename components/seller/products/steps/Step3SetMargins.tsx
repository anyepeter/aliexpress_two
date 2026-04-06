"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import type { DummyProduct, SellerProductForm } from "@/lib/types/sellerProduct";
import MarginSliderRow from "../MarginSliderRow";

interface Step3SetMarginsProps {
  products: DummyProduct[];
  savedForms: Map<number, SellerProductForm>;
  onNext: (forms: SellerProductForm[]) => void;
  onBack: () => void;
  isSaving: boolean;
}

const DEFAULT_MARGIN = 12;

export default function Step3SetMargins({
  products,
  savedForms,
  onNext,
  onBack,
  isSaving,
}: Step3SetMarginsProps) {
  const [margins, setMargins] = useState<Map<number, number>>(() => {
    const m = new Map<number, number>();
    for (const p of products) {
      m.set(p.id, savedForms.get(p.id)?.marginPercent ?? DEFAULT_MARGIN);
    }
    return m;
  });

  const setAll = (value: number) => {
    setMargins(() => {
      const m = new Map<number, number>();
      for (const p of products) m.set(p.id, value);
      return m;
    });
  };

  const totalProfit = products.reduce((sum, p) => {
    const m = margins.get(p.id) ?? DEFAULT_MARGIN;
    return sum + p.price * (m / 100);
  }, 0);

  const buildForms = (): SellerProductForm[] =>
    products.map((p) => {
      const m = margins.get(p.id) ?? DEFAULT_MARGIN;
      return {
        dummyProductId: p.id,
        title: p.title,
        description: p.description,
        images: p.images,
        category: p.category,
        subcategory: p.subcategory ?? null,
        brand: p.brand,
        basePrice: p.price,
        marginPercent: m,
        sellingPrice: parseFloat((p.price * (1 + m / 100)).toFixed(2)),
        discountPct: p.discountPercentage,
        stock: p.stock,
        tags: p.tags ?? [],
        rating: p.rating,
        ratingCount: undefined,
      };
    });

  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Set Profit Margins</h2>
        <p className="text-sm text-gray-500 mt-1">
          Slide to set your markup on each product. Range: 10% – 15%.
        </p>
      </div>

      {/* Summary bar */}
      <div className="bg-[#E53935]/5 rounded-xl p-3 mb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-600">
            Est. profit on full stock:{" "}
            <span className="font-bold text-green-700">${totalProfit.toFixed(2)}</span>
          </span>
        </div>
        {/* Set all buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Set all:</span>
          {[10, 12, 15].map((v) => (
            <button
              key={v}
              onClick={() => setAll(v)}
              className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 hover:border-[#E53935] hover:text-[#E53935] font-medium transition-colors"
            >
              {v}%
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
        {products.map((p) => (
          <MarginSliderRow
            key={p.id}
            product={p}
            margin={margins.get(p.id) ?? DEFAULT_MARGIN}
            onChange={(m) => setMargins((prev) => new Map(prev).set(p.id, m))}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#E53935] font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={() => onNext(buildForms())}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#E53935] text-white rounded-xl font-semibold text-sm hover:bg-[#C62828] transition-colors disabled:opacity-60"
        >
          {isSaving ? "Saving…" : "Save & Arrange"}
          {!isSaving && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
