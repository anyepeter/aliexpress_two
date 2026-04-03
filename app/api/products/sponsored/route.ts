import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Find all stores with active ad subscriptions, ordered by plan tier (Premium first)
    const activeSubs = await prisma.adSubscription.findMany({
      where: { status: "ACTIVE" },
      include: {
        plan: { select: { tier: true, sortOrder: true } },
        store: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            logoUrl: true,
            isVerified: true,
          },
        },
      },
      orderBy: { plan: { sortOrder: "desc" } }, // Premium first
    });

    if (activeSubs.length === 0) return NextResponse.json([]);

    // Get published products from these stores
    const storeIds = activeSubs.map((s) => s.storeId);
    const sellerProducts = await prisma.sellerProduct.findMany({
      where: {
        storeId: { in: storeIds },
        status: "PUBLISHED",
      },
      orderBy: { sortOrder: "asc" },
      take: 20,
    });

    if (sellerProducts.length === 0) return NextResponse.json([]);

    // Fetch product data from catalog
    const dummyIds = sellerProducts.map((p) => p.dummyProductId);
    const productRecords = await prisma.product.findMany({
      where: { id: { in: dummyIds } },
    });
    const productMap = new Map(productRecords.map((p) => [p.id, p]));

    // Build store → subscription map for tier info
    const storeTierMap = new Map(activeSubs.map((s) => [s.storeId, s.plan.tier]));
    const storeMap = new Map(activeSubs.map((s) => [s.storeId, s.store]));

    const sponsored = sellerProducts
      .map((sp) => {
        const prodData = productMap.get(sp.dummyProductId);
        if (!prodData) return null;
        const store = storeMap.get(sp.storeId);
        if (!store) return null;

        return {
          id: sp.id,
          dummyProductId: sp.dummyProductId,
          title: sp.title,
          thumbnail: prodData.thumbnail ?? "",
          sellingPrice: sp.sellingPrice,
          rating: prodData.rating ?? 0,
          discountPercentage: prodData.discountPercentage ?? 0,
          brand: sp.brand ?? prodData.brand ?? "Unknown",
          category: sp.category,
          description: sp.description ?? prodData.description,
          stock: prodData.stock ?? 0,
          images: prodData.images ?? [],
          store: {
            storeName: store.storeName,
            storeSlug: store.storeSlug,
            logoUrl: store.logoUrl,
            isVerified: store.isVerified,
          },
          planTier: storeTierMap.get(sp.storeId) ?? "BASIC",
        };
      })
      .filter(Boolean);

    // Sort: Premium stores' products first, then Standard, then Basic
    const tierOrder: Record<string, number> = { PREMIUM: 0, STANDARD: 1, BASIC: 2 };
    sponsored.sort((a, b) => (tierOrder[a!.planTier] ?? 3) - (tierOrder[b!.planTier] ?? 3));

    return NextResponse.json(sponsored.slice(0, 10));
  } catch (error) {
    console.error("Sponsored products error:", error);
    return NextResponse.json([]);
  }
}
