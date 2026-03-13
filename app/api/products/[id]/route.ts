import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MarketplaceProduct, StoreInfo } from "@/lib/types/marketplace";

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

// GET /api/products/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const isDummy = id.startsWith("dummy-");

  // ── DummyJSON fallback product ─────────────────────────────────────────────
  if (isDummy) {
    const dummyId = parseInt(id.replace("dummy-", ""), 10);
    if (isNaN(dummyId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const dummy = await fetchDummy(dummyId);
    if (!dummy) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const product: MarketplaceProduct = {
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
    return NextResponse.json({ product });
  }

  // ── Seller product ─────────────────────────────────────────────────────────
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
          userId: true,
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
          user: { select: { email: true, phone: true } },
        },
      },
    },
  });

  if (!sellerProduct) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const dummy = await fetchDummy(sellerProduct.dummyProductId);
  if (!dummy) {
    return NextResponse.json({ error: "Product data unavailable" }, { status: 503 });
  }

  const storeInfo: StoreInfo = {
    id: sellerProduct.store.id,
    userId: sellerProduct.store.userId,
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
  };

  const product: MarketplaceProduct = {
    id: sellerProduct.id,
    dummyProductId: sellerProduct.dummyProductId,
    title: sellerProduct.title,
    thumbnail: dummy.thumbnail,
    images: dummy.images ?? [],
    brand: sellerProduct.brand ?? dummy.brand ?? "Unknown",
    category: sellerProduct.category,
    sellingPrice: sellerProduct.sellingPrice, // NEVER expose basePrice
    rating: dummy.rating,
    discountPercentage: dummy.discountPercentage,
    stock: dummy.stock,
    description: sellerProduct.description ?? dummy.description,
    store: storeInfo,
    isPremium: sellerProduct.store.isVerified,
  };

  return NextResponse.json({ product });
}
