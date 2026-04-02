export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopBanner from "@/components/layout/TopBanner";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductInfo from "@/components/products/ProductInfo";
import StoreInfoCard from "@/components/products/StoreInfoCard";
import MoreFromStore from "@/components/products/MoreFromStore";
import SimilarProducts from "@/components/products/SimilarProducts";
import type { MarketplaceProduct, StoreInfo } from "@/lib/types/marketplace";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string): Promise<MarketplaceProduct | null> {
  const isDummy = id.startsWith("dummy-");

  // ── Product from local DB ───────────────────────────────────────────
  if (isDummy) {
    const dummyId = parseInt(id.replace("dummy-", ""), 10);
    if (isNaN(dummyId)) return null;
    const prodData = await prisma.product.findUnique({ where: { id: dummyId } });
    if (!prodData) return null;
    return {
      id: `dummy-${prodData.id}`,
      dummyProductId: prodData.id,
      title: prodData.title,
      thumbnail: prodData.thumbnail ?? "",
      images: prodData.images ?? [],
      brand: prodData.brand ?? "Unknown",
      category: prodData.category,
      sellingPrice: prodData.price,
      rating: prodData.rating ?? 0,
      discountPercentage: prodData.discountPercentage ?? 0,
      stock: prodData.stock ?? 0,
      description: prodData.description,
      shortDescription: prodData.shortDescription,
      keyFeatures: prodData.keyFeatures,
      store: null,
      isPremium: false,
    };
  }

  // ── Seller product ───────────────────────────────────────────────────────
  const sellerProduct = await prisma.sellerProduct.findFirst({
    where: {
      id,
      status: "PUBLISHED",
      store: { user: { status: "ACTIVE" } },
    },
    include: {
      store: {
        select: {
          id: true,
          storeName: true,
          storeSlug: true,
          logoUrl: true,
          bannerUrl: true,
          description: true,
          isVerified: true,
          createdAt: true,
          country: true,
          city: true,
          socialLinks: true,
          averageRating: true,
          totalReviews: true,
          ratingOverride: true,
          user: { select: { id: true, email: true, phone: true } },
        },
      },
    },
  });

  if (!sellerProduct) return null;

  const prodData = await prisma.product.findUnique({ where: { id: sellerProduct.dummyProductId } });
  if (!prodData) return null;

  const storeInfo: StoreInfo = {
    id: sellerProduct.store.id,
    storeName: sellerProduct.store.storeName,
    storeSlug: sellerProduct.store.storeSlug,
    logoUrl: sellerProduct.store.logoUrl,
    bannerUrl: sellerProduct.store.bannerUrl,
    description: sellerProduct.store.description,
    isVerified: sellerProduct.store.isVerified,
    createdAt: sellerProduct.store.createdAt.toISOString(),
    ownerEmail: sellerProduct.store.user?.email ?? null,
    ownerPhone: sellerProduct.store.user?.phone ?? null,
    country: sellerProduct.store.country ?? null,
    city: sellerProduct.store.city ?? null,
    socialLinks: (sellerProduct.store.socialLinks as Record<string, string>) ?? null,
    userId: sellerProduct.store.user?.id ?? "",
    averageRating: sellerProduct.store.ratingOverride ?? sellerProduct.store.averageRating ?? null,
    totalReviews: sellerProduct.store.totalReviews ?? 0,
    ratingOverride: sellerProduct.store.ratingOverride ?? null,
  };

  return {
    id: sellerProduct.id,
    dummyProductId: sellerProduct.dummyProductId,
    title: sellerProduct.title,
    thumbnail: prodData.thumbnail ?? "",
    images: prodData.images ?? [],
    brand: sellerProduct.brand ?? prodData.brand ?? "Unknown",
    category: sellerProduct.category,
    sellingPrice: sellerProduct.sellingPrice,
    rating: prodData.rating ?? 0,
    discountPercentage: prodData.discountPercentage ?? 0,
    stock: prodData.stock ?? 0,
    description: sellerProduct.description ?? prodData.description,
    shortDescription: prodData.shortDescription,
    keyFeatures: prodData.keyFeatures,
    store: storeInfo,
    isPremium: sellerProduct.store.isVerified,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.title} | AliExpress`,
    description: product.description.slice(0, 155),
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6FA]">
      <TopBanner />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6">
          <a href="/" className="hover:text-[#E53935]">Home</a>
          <span className="mx-1.5">/</span>
          <a href="/shop" className="hover:text-[#E53935]">Shop</a>
          <span className="mx-1.5">/</span>
          <span className="text-[#1A1A1A]">{product.title}</span>
        </nav>

        {/* Main 2-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProductImageGallery images={product.images} title={product.title} />
          <div className="flex flex-col gap-6">
            <ProductInfo product={product} />
            {product.store && <StoreInfoCard store={product.store} />}
          </div>
        </div>

        {/* More from store + similar products */}
        {product.store && (
          <MoreFromStore
            storeSlug={product.store.storeSlug}
            excludeId={product.id}
          />
        )}
        <SimilarProducts category={product.category} excludeId={product.id} />
      </main>

      <Footer />
    </div>
  );
}
