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

async function fetchDummy(dummyId: number): Promise<DummyProduct | null> {
  try {
    const r = await fetch(`https://dummyjson.com/products/${dummyId}`, {
      next: { revalidate: 3600 },
    });
    return r.ok ? (r.json() as Promise<DummyProduct>) : null;
  } catch {
    return null;
  }
}

async function getProduct(id: string): Promise<MarketplaceProduct | null> {
  const isDummy = id.startsWith("dummy-");

  // ── DummyJSON fallback product ───────────────────────────────────────────
  if (isDummy) {
    const dummyId = parseInt(id.replace("dummy-", ""), 10);
    if (isNaN(dummyId)) return null;
    const dummy = await fetchDummy(dummyId);
    if (!dummy) return null;
    return {
      id: `dummy-${dummy.id}`,
      dummyProductId: dummy.id,
      title: dummy.title,
      thumbnail: dummy.thumbnail,
      images: dummy.images ?? [],
      brand: dummy.brand ?? "Unknown",
      category: dummy.category,
      sellingPrice: dummy.price,
      rating: dummy.rating,
      discountPercentage: dummy.discountPercentage,
      stock: dummy.stock,
      description: dummy.description,
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
          user: { select: { id: true, email: true, phone: true } },
        },
      },
    },
  });

  if (!sellerProduct) return null;

  const dummy = await fetchDummy(sellerProduct.dummyProductId);
  if (!dummy) return null;

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
  };

  return {
    id: sellerProduct.id,
    dummyProductId: sellerProduct.dummyProductId,
    title: sellerProduct.title,
    thumbnail: dummy.thumbnail,
    images: dummy.images ?? [],
    brand: sellerProduct.brand ?? dummy.brand ?? "Unknown",
    category: sellerProduct.category,
    sellingPrice: sellerProduct.sellingPrice,
    rating: dummy.rating,
    discountPercentage: dummy.discountPercentage,
    stock: dummy.stock,
    description: sellerProduct.description ?? dummy.description,
    store: storeInfo,
    isPremium: sellerProduct.store.isVerified,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.title} | MarketHub`,
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
