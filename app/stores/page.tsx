export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopBanner from "@/components/layout/TopBanner";
import StoreCard from "@/components/store/StoreCard";
import { getAllStores } from "@/lib/api/marketplace-server";
import { Store } from "lucide-react";

export const metadata: Metadata = {
  title: "All Stores & Verified Sellers",
  description:
    "Discover 50,000+ verified stores and sellers on AliExpress. Browse by category, rating, and location. Every store is vetted for quality and reliability.",
  alternates: { canonical: "https://aliexpressexpress.com/stores" },
};

export default async function StoresPage() {
  const stores = await getAllStores();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6FA]">
      <TopBanner />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6">
          <a href="/" className="hover:text-[#E53935]">Home</a>
          <span className="mx-1.5">/</span>
          <span className="text-[#1A1A1A]">Stores</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            All Stores
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Discover {stores.length} seller{stores.length !== 1 ? "s" : ""} on AliExpress
          </p>
        </div>

        {stores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-1">
              No stores yet
            </h2>
            <p className="text-sm text-gray-500 max-w-sm">
              Be the first to open a store on AliExpress and start selling your products.
            </p>
            <a
              href="/auth/register/seller"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#E53935] text-white text-sm font-semibold rounded-lg hover:bg-[#C62828] transition-colors"
            >
              Start Selling
            </a>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
