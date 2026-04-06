export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "AliExpress — Shop from 50,000+ Verified Sellers Worldwide",
  description:
    "Discover millions of products at unbeatable prices from verified sellers across 190+ countries. Electronics, Fashion, Beauty, Home & Garden. Free shipping on orders over $50. Buyer protection guaranteed.",
  alternates: { canonical: "https://aliexpressexpress.com" },
};

import TopBanner from "@/components/layout/TopBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import HeroCarousel from "@/components/home/HeroCarousel";
import TrustBadges from "@/components/home/TrustBadges";
import TodaysDeals from "@/components/home/TodaysDeals";
import PromoBanners from "@/components/home/PromoBanners";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import { ProductCardSkeleton } from "@/components/home/ProductCard";
import SponsoredProducts from "@/components/home/SponsoredProducts";

import { getCategories } from "@/lib/api/products";
import {
  getFeaturedMarketplaceProducts,
  getFlashDealProducts,
  getTodaysDeals,
  getVerifiedStores,
} from "@/lib/api/marketplace-server";

function TodaysDealsSkeleton() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mx-auto mb-6" />
      <div className="flex flex-col lg:flex-row gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="flex-1 border border-gray-200 rounded-2xl p-5 bg-white">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex-shrink-0 w-[155px]">
                  <div className="aspect-square bg-gray-200 rounded-lg animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-1.5" />
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedSkeleton() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-5 w-16 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  // All data fetched in parallel on the server
  const [categories, flashDealData, featuredProducts, verifiedStores, todaysDeals] =
    await Promise.all([
      getCategories(),
      getFlashDealProducts(10),
      getFeaturedMarketplaceProducts(20),
      getVerifiedStores(10),
      getTodaysDeals(),
    ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AliExpress",
    url: "https://aliexpressexpress.com",
    description:
      "Global multi-vendor marketplace with 50,000+ verified sellers across 190+ countries.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://aliexpressexpress.com/shop?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AliExpress",
    url: "https://aliexpressexpress.com",
    logo: "https://aliexpressexpress.com/og-image.png",
    description:
      "Global multi-vendor marketplace connecting buyers and sellers in 190+ countries.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@aliexpressexpress.com",
      availableLanguage: "English",
    },
    sameAs: [],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      {/* 1. Dismissible announcement bar */}
      <TopBanner />

      {/* 2. Sticky navigation */}
      <Navbar />

      <main className="flex-1">
        {/* 3. Auto-sliding hero carousel */}
        <HeroCarousel />

        {/* 4. Trust badges strip */}
        <TrustBadges />

        {/* 5. Sponsored Products from advertisers */}
        <SponsoredProducts />

        {/* 6. Today's Deals — Dollar Express + SuperDeals */}
        {/* <Suspense fallback={<TodaysDealsSkeleton />}>
          <TodaysDeals
            dollarExpress={todaysDeals.dollarExpress}
            superDeals={todaysDeals.superDeals}
          />
        </Suspense> */}

        {/* 7. 3-column promotional banners */}
        <PromoBanners />

        {/* 8. Featured marketplace products grid with load more */}
        <Suspense fallback={<FeaturedSkeleton />}>
          <FeaturedProducts
            initialProducts={featuredProducts}
            verifiedStores={verifiedStores}
          />
        </Suspense>
      </main>

      {/* 9. Full footer */}
      <Footer />
    </div>
  );
}
