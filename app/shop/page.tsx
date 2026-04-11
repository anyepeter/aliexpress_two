// Revalidate every 60 seconds — cached responses make category navigation
// nearly instant since we don't re-query the entire marketplace on every click.
export const revalidate = 60;

import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import { getAllMarketplaceProducts } from "@/lib/api/marketplace";
import ShopContent from "@/components/shop/ShopContent";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse thousands of products from verified sellers on AliExpress. Electronics, Fashion, Beauty, Home & more with powerful filtering, sorting, and buyer protection.",
  alternates: { canonical: "https://aliexpressexpress.com/shop" },
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
