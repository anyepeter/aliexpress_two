"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { MarketplaceProduct } from "@/lib/types/marketplace";

interface MoreFromStoreProps {
  storeSlug: string;
  excludeId: string;
}

export default function MoreFromStore({
  storeSlug,
  excludeId,
}: MoreFromStoreProps) {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `/api/store/${storeSlug}/products?exclude=${excludeId}&limit=8`
    )
      .then((r) => r.json())
      .then((data: { products: MarketplaceProduct[] }) => {
        setProducts(data.products ?? []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [storeSlug, excludeId]);

  if (loading || products.length < 2) return null;

  return (
    <section className="mt-10">
      <h2 className="text-base font-bold text-[#1A1A1A] mb-4">
        More from this store
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.id}`}
            className="flex-shrink-0 w-36 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={p.thumbnail}
                alt={p.title}
                fill
                className="object-cover"
                sizes="144px"
              />
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-[#1A1A1A] line-clamp-2 leading-snug">
                {p.title}
              </p>
              <p className="text-xs font-bold text-[#1A1A1A] mt-1">
                ${p.sellingPrice.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
