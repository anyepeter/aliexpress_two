import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activeSubs = await prisma.adSubscription.findMany({
      where: { status: "ACTIVE" },
      include: {
        plan: true,
        store: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            logoUrl: true,
            bannerUrl: true,
            description: true,
            isVerified: true,
            country: true,
            city: true,
            averageRating: true,
            totalReviews: true,
            ratingOverride: true,
            analytics: { select: { totalViews: true, totalOrders: true } },
            _count: { select: { sellerProducts: { where: { status: "PUBLISHED" } } } },
          },
        },
      },
      orderBy: { plan: { sortOrder: "desc" } },
    });

    if (activeSubs.length === 0) return NextResponse.json([]);

    // For each store, get up to 4 products
    const stores = await Promise.all(
      activeSubs.map(async (sub) => {
        const products = await prisma.sellerProduct.findMany({
          where: { storeId: sub.storeId, status: "PUBLISHED" },
          orderBy: { sortOrder: "asc" },
          take: 4,
        });

        const dummyIds = products.map((p) => p.dummyProductId);
        const productRecords = await prisma.product.findMany({
          where: { id: { in: dummyIds } },
        });
        const productMap = new Map(productRecords.map((p) => [p.id, p]));

        const enrichedProducts = products
          .map((p) => {
            const pd = productMap.get(p.dummyProductId);
            if (!pd) return null;
            return {
              id: p.id,
              title: p.title,
              thumbnail: pd.thumbnail ?? "",
              sellingPrice: p.sellingPrice,
              discountPercentage: pd.discountPercentage ?? 0,
              rating: pd.rating ?? 0,
            };
          })
          .filter(Boolean);

        return {
          id: sub.store.id,
          storeName: sub.store.storeName,
          storeSlug: sub.store.storeSlug,
          logoUrl: sub.store.logoUrl,
          bannerUrl: sub.store.bannerUrl,
          description: sub.store.description,
          isVerified: sub.store.isVerified,
          country: sub.store.country,
          city: sub.store.city,
          rating: sub.store.ratingOverride ?? sub.store.averageRating ?? null,
          totalReviews: sub.store.totalReviews,
          totalViews: sub.store.analytics?.totalViews ?? 0,
          totalOrders: sub.store.analytics?.totalOrders ?? 0,
          productCount: sub.store._count.sellerProducts,
          plan: {
            name: sub.plan.name,
            tier: sub.plan.tier,
          },
          endDate: sub.endDate?.toISOString() ?? null,
          products: enrichedProducts,
        };
      })
    );

    return NextResponse.json(stores);
  } catch (error) {
    console.error("Sponsored stores error:", error);
    return NextResponse.json([]);
  }
}
