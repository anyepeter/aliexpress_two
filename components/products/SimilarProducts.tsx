"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { MarketplaceProduct } from "@/lib/types/marketplace";

interface SimilarProductsProps {
  category: string;
  excludeId: string;
}

export default function SimilarProducts({
  category,
  excludeId,
}: SimilarProductsProps) {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `/api/products/marketplace?category=${encodeURIComponent(category)}&exclude=${excludeId}&limit=8`
    )
      .then((r) => r.json())
      .then((data: { products: MarketplaceProduct[] }) => {
        setProducts(data.products ?? []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, excludeId]);

  if (loading || products.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-base font-bold text-[#1A1A1A] mb-4">
        Similar Products
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.slice(0, 8).map((p) => {
          const fullStars = Math.floor(p.rating);
          const hasHalf = p.rating - fullStars >= 0.5;

          return (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow overflow-hidden flex flex-col"
            >
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={p.thumbnail}
                  alt={p.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>
              <div className="p-2.5 flex flex-col gap-1 flex-1">
                <p className="text-xs font-medium text-[#1A1A1A] line-clamp-2 leading-snug flex-1">
                  {p.title}
                </p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-2.5 h-2.5 ${
                        i < fullStars
                          ? "fill-[#E53935] text-[#E53935]"
                          : i === fullStars && hasHalf
                          ? "fill-[#E53935]/50 text-[#E53935]"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm font-bold text-[#1A1A1A]">
                  ${p.sellingPrice.toFixed(2)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
