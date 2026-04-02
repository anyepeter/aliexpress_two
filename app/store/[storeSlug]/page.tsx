export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopBanner from "@/components/layout/TopBanner";
import StoreBanner from "@/components/store/StoreBanner";
import StoreProductsGrid from "@/components/store/StoreProductsGrid";
import StoreReviews from "@/components/store/StoreReviews";
import type { MarketplaceProduct, StoreInfo } from "@/lib/types/marketplace";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

async function getStoreData(storeSlug: string) {
  const store = await prisma.store.findUnique({
    where: { storeSlug },
    include: { user: { select: { id: true, status: true, email: true, phone: true } } },
  });

  if (!store || store.user.status !== "ACTIVE") return null;

  const storeInfo: StoreInfo = {
    id: store.id,
    storeName: store.storeName,
    storeSlug: store.storeSlug,
    logoUrl: store.logoUrl,
    bannerUrl: store.bannerUrl,
    description: store.description,
    isVerified: store.isVerified,
    createdAt: store.createdAt.toISOString(),
    ownerEmail: store.user?.email ?? null,
    ownerPhone: store.user?.phone ?? null,
    country: store.country ?? null,
    city: store.city ?? null,
    socialLinks: (store.socialLinks as Record<string, string>) ?? null,
    userId: store.user.id,
    averageRating: store.ratingOverride ?? store.averageRating ?? null,
    totalReviews: store.totalReviews ?? 0,
    ratingOverride: store.ratingOverride ?? null,
  };

  const sellerProducts = await prisma.sellerProduct.findMany({
    where: { storeId: store.id, status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
    take: 12,
  });

  const total = await prisma.sellerProduct.count({
    where: { storeId: store.id, status: "PUBLISHED" },
  });

  const allPublished = await prisma.sellerProduct.findMany({
    where: { storeId: store.id, status: "PUBLISHED" },
    select: { category: true },
  });
  const categories = [...new Set(allPublished.map((p) => p.category))].sort();

  // Batch fetch product data from local DB
  const dummyIds = sellerProducts.map((p) => p.dummyProductId);
  const productRecords = await prisma.product.findMany({
    where: { id: { in: dummyIds } },
  });
  const productMap = new Map(productRecords.map((p) => [p.id, p]));

  const enriched = sellerProducts.map((p) => {
    const prodData = productMap.get(p.dummyProductId);
    if (!prodData) return null;
    return {
      id: p.id,
      dummyProductId: p.dummyProductId,
      title: p.title,
      thumbnail: prodData.thumbnail ?? "",
      images: prodData.images ?? [],
      brand: p.brand ?? prodData.brand ?? "Unknown",
      category: p.category,
      sellingPrice: p.sellingPrice,
      rating: prodData.rating ?? 0,
      discountPercentage: prodData.discountPercentage ?? 0,
      stock: prodData.stock ?? 0,
      description: p.description ?? prodData.description,
      shortDescription: prodData.shortDescription,
      keyFeatures: prodData.keyFeatures,
      store: storeInfo,
      isPremium: store.isVerified,
    } as MarketplaceProduct;
  });

  const products = enriched.filter((p): p is MarketplaceProduct => p !== null);
  const hasMore = 12 < total;

  return { store: storeInfo, products, total, hasMore, categories };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  const data = await getStoreData(storeSlug);
  if (!data) return { title: "Store Not Found" };
  return {
    title: `${data.store.storeName} | AliExpress`,
    description:
      data.store.description ?? `Shop at ${data.store.storeName} on AliExpress`,
  };
}

export default async function StorePage({ params }: PageProps) {
  const { storeSlug } = await params;
  const data = await getStoreData(storeSlug);

  if (!data) notFound();

  const { store, products, total, hasMore, categories } = data;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6FA]">
      <TopBanner />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6">
          <a href="/" className="hover:text-[#E53935]">Home</a>
          <span className="mx-1.5">/</span>
          <a href="/stores" className="hover:text-[#E53935]">Stores</a>
          <span className="mx-1.5">/</span>
          <span className="text-[#1A1A1A]">{store.storeName}</span>
        </nav>

        {/* Banner */}
        <div className="mb-8">
          <StoreBanner store={store} productCount={total} />
        </div>

        {/* Products grid with sidebar */}
        <StoreProductsGrid
          initialProducts={products}
          initialCategories={categories}
          initialTotal={total}
          initialHasMore={hasMore}
          store={store}
        />

        {/* Customer Reviews */}
        <div className="mt-8">
          <StoreReviews storeId={store.id} storeName={store.storeName} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
