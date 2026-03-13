export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import { getAllMarketplaceProducts } from "@/lib/api/marketplace";
import ShopContent from "@/components/shop/ShopContent";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse thousands of products from verified sellers on MarketHub Express. Electronics, Fashion, Beauty, Home & more with powerful filtering, sorting, and buyer protection.",
  alternates: { canonical: "https://markethubexpress.com/shop" },
};

interface ShopPageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [allProducts, params] = await Promise.all([
    getAllMarketplaceProducts(),
    searchParams,
  ]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F6FA]">
        <ShopContent allProducts={allProducts} initialParams={params} />
      </main>
    </>
  );
}
