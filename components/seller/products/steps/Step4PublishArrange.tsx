"use client";

import { useState } from "react";
import { ChevronLeft, Rocket, Info } from "lucide-react";
import type { DummyProduct, SavedSellerProduct } from "@/lib/types/sellerProduct";
import DraggableProductRow from "../DraggableProductRow";

interface Step4PublishArrangeProps {
  products: DummyProduct[];
  saved: SavedSellerProduct[];
  onPublish: (order: string[], enabledIds: Set<string>) => void;
  onBack: () => void;
  isPublishing: boolean;
}

export default function Step4PublishArrange({
  products,
  saved,
  onPublish,
  onBack,
  isPublishing,
}: Step4PublishArrangeProps) {
  // Build an ordered list of saved IDs
  const [order, setOrder] = useState<string[]>(() =>
    saved
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => s.id)
  );

  // Which products are enabled (published)
  const [enabled, setEnabled] = useState<Set<string>>(
    () => new Set(saved.filter((s) => s.status === "PUBLISHED").map((s) => s.id))
  );

  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const toggleEnabled = (id: string) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDrop = () => {
    if (dragFrom === null || dragOver === null || dragFrom === dragOver) {
      setDragFrom(null);
      setDragOver(null);
      return;
    }
    const newOrder = [...order];
    const [moved] = newOrder.splice(dragFrom, 1);
    newOrder.splice(dragOver, 0, moved);
    setOrder(newOrder);
    setDragFrom(null);
    setDragOver(null);
  };

  // Build product map for quick lookup
  const productMap = new Map(products.map((p) => [p.id, p]));
  const savedMap = new Map(saved.map((s) => [s.id, s]));

  const orderedItems = order
    .map((id) => savedMap.get(id))
    .filter((s): s is SavedSellerProduct => !!s);

  const enabledCount = enabled.size;

  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Arrange & Publish</h2>
        <p className="text-sm text-gray-500 mt-1">
          Drag to reorder. Toggle which products are visible in your store.
        </p>
      </div>

      {/* Tip + Publish All */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-2 bg-[#E53935]/10 rounded-xl p-3 text-xs text-[#9a6d17] flex-1">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Drag rows to reorder. Toggle individual visibility, or use{" "}
            <strong>Publish All</strong> to enable every product at once.
          </p>
        </div>
        <button
          onClick={() => setEnabled(new Set(order))}
          className="flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl border-2 border-[#E53935] text-[#E53935] hover:bg-[#C62828] hover:text-white transition-colors"
        >
          Select All
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
        {orderedItems.map((s, idx) => {
          const dummy = productMap.get(s.dummyProductId);
          if (!dummy) return null;
          return (
            <DraggableProductRow
              key={s.id}
              product={dummy}
              saved={s}
              index={idx}
              enabled={enabled.has(s.id)}
              onToggle={toggleEnabled}
              onDragStart={(i) => setDragFrom(i)}
              onDragOver={(i) => setDragOver(i)}
              onDrop={handleDrop}
              isDragging={dragFrom === idx}
              isDragOver={dragOver === idx}
            />
          );
        })}
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
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <span className="text-sm text-gray-500">
            <span className="font-bold text-[#E53935]">{enabledCount}</span> of {order.length} selected
          </span>
          {/* Publish All — selects everyone then fires */}
          <button
            onClick={() => {
              const allIds = new Set(order);
              setEnabled(allIds);
              onPublish(order, allIds);
            }}
            disabled={isPublishing}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E53935] text-white rounded-xl font-bold text-sm hover:bg-[#C62828] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Rocket className="w-4 h-4" />
            {isPublishing ? "Publishing…" : "Publish All"}
          </button>
          {/* Publish selected */}
          <button
            onClick={() => onPublish(order, enabled)}
            disabled={enabledCount === 0 || isPublishing}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E53935] text-white rounded-xl font-bold text-sm hover:bg-[#C62828] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Rocket className="w-4 h-4" />
            Publish Selected
          </button>
        </div>
      </div>
    </div>
  );
}
