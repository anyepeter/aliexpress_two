export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopBanner from "@/components/layout/TopBanner";
import SponsoredStoresClient from "@/components/sponsored/SponsoredStoresClient";

export const metadata: Metadata = {
  title: "Sponsored Stores — MarketHub",
  description: "Discover promoted stores and their products on MarketHub.",
};

export default function SponsoredPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6FA]">
      <TopBanner />
      <Navbar />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        <SponsoredStoresClient />
      </main>

      <Footer />
    </div>
  );
}
