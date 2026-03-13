import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";
import StoreHeader from "@/components/shop/store/StoreHeader";
import StoreProductGrid from "@/components/shop/store/StoreProductGrid";
import type { StoreProduct } from "@/components/shop/store/StoreProductGrid";

interface Props {
  params: Promise<{ storeSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = await prisma.store.findUnique({
    where: { storeSlug },
    select: { storeName: true, description: true },
  });
  if (!store) return { title: "Store not found — MarketHub" };
  return {
    title: `${store.storeName} — MarketHub`,
    description: store.description ?? `Shop at ${store.storeName} on MarketHub`,
  };
}

export default async function StorePage({ params }: Props) {
  const { storeSlug } = await params;

  const store = await prisma.store.findUnique({
    where: { storeSlug },
    include: {
      user: { select: { firstName: true, lastName: true } },
      sellerProducts: {
        where: { status: "PUBLISHED" },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!store) notFound();

  const products: StoreProduct[] = store.sellerProducts.map((p) => ({
    id: p.id,
    title: p.title,
    images: p.images as string[],
    sellingPrice: p.sellingPrice,
    rating: p.rating,
    category: p.category,
  }));

  const ownerName = `${store.user.firstName} ${store.user.lastName}`.trim();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F6FA]">
        <StoreHeader
          storeName={store.storeName}
          description={store.description}
          logoUrl={store.logoUrl}
          bannerUrl={store.bannerUrl}
          country={store.country}
          city={store.city}
          isVerified={store.isVerified}
          ownerName={ownerName}
          productCount={products.length}
          websiteUrl={store.websiteUrl}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {products.length > 0 ? (
            <StoreProductGrid products={products} />
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-sm font-medium">No products available yet.</p>
              <p className="text-gray-300 text-xs mt-1">
                Check back soon — this store is still setting up.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
