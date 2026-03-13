export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopBanner from "@/components/layout/TopBanner";
import StoreBanner from "@/components/store/StoreBanner";
import StoreProductsGrid from "@/components/store/StoreProductsGrid";
import type { MarketplaceProduct, StoreInfo } from "@/lib/types/marketplace";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

type DummyProduct = {
  id: number;
  title: string;
  thumbnail: string;
  images: string[];
  brand?: string;
  category: string;
  price: number;
  rating: number;
  discountPercentage: number;
  stock: number;
  description: string;
};

async function fetchDummy(id: number): Promise<DummyProduct | null> {
  try {
    const r = await fetch(`https://dummyjson.com/products/${id}`, {
      next: { revalidate: 3600 },
    });
    return r.ok ? (r.json() as Promise<DummyProduct>) : null;
  } catch {
    return null;
  }
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

  const enriched = await Promise.all(
    sellerProducts.map(async (p) => {
      const dummy = await fetchDummy(p.dummyProductId);
      if (!dummy) return null;
      return {
        id: p.id,
        dummyProductId: p.dummyProductId,
        title: p.title,
        thumbnail: dummy.thumbnail,
        images: dummy.images ?? [],
        brand: p.brand ?? dummy.brand ?? "Unknown",
        category: p.category,
        sellingPrice: p.sellingPrice,
        rating: dummy.rating,
        discountPercentage: dummy.discountPercentage,
        stock: dummy.stock,
        description: p.description ?? dummy.description,
        store: storeInfo,
        isPremium: store.isVerified,
      } as MarketplaceProduct;
    })
  );

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
    title: `${data.store.storeName} | MarketHub`,
    description:
      data.store.description ?? `Shop at ${data.store.storeName} on MarketHub`,
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
      </main>

      <Footer />
    </div>
  );
}
