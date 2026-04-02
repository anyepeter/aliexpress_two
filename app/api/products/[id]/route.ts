import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MarketplaceProduct, StoreInfo } from "@/lib/types/marketplace";

// GET /api/products/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const isDummy = id.startsWith("dummy-");

  // ── Product from local DB ─────────────────────────────────────────────
  if (isDummy) {
    const dummyId = parseInt(id.replace("dummy-", ""), 10);
    if (isNaN(dummyId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const prodData = await prisma.product.findUnique({ where: { id: dummyId } });
    if (!prodData) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const product: MarketplaceProduct = {
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
          averageRating: true,
          totalReviews: true,
          ratingOverride: true,
          user: { select: { email: true, phone: true } },
        },
      },
    },
  });

  if (!sellerProduct) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const prodData = await prisma.product.findUnique({ where: { id: sellerProduct.dummyProductId } });
  if (!prodData) {
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
    averageRating: sellerProduct.store.ratingOverride ?? sellerProduct.store.averageRating ?? null,
    totalReviews: sellerProduct.store.totalReviews ?? 0,
    ratingOverride: sellerProduct.store.ratingOverride ?? null,
  };

  const product: MarketplaceProduct = {
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

  return NextResponse.json({ product });
}
