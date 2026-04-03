import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") ?? "relevance";
    const limit = limitParam ? parseInt(limitParam) : undefined;

    // Find all stores with active ad subscriptions
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
      orderBy: { plan: { sortOrder: "desc" } },
    });

    if (activeSubs.length === 0) return NextResponse.json([]);

    const storeIds = activeSubs.map((s) => s.storeId);

    // Get published products from sponsored stores
    const sellerProducts = await prisma.sellerProduct.findMany({
      where: {
        storeId: { in: storeIds },
        status: "PUBLISHED",
        ...(category ? { category } : {}),
      },
      orderBy: { sortOrder: "asc" },
    });

    if (sellerProducts.length === 0) return NextResponse.json([]);

    // Fetch product data from catalog
    const dummyIds = sellerProducts.map((p) => p.dummyProductId);
    const productRecords = await prisma.product.findMany({
      where: { id: { in: dummyIds } },
    });
    const productMap = new Map(productRecords.map((p) => [p.id, p]));

    const storeTierMap = new Map(activeSubs.map((s) => [s.storeId, s.plan.tier]));
    const storeMap = new Map(activeSubs.map((s) => [s.storeId, s.store]));

    let sponsored = sellerProducts
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
      .filter(Boolean) as NonNullable<ReturnType<typeof Array.prototype.map>[number]>[];

    // Sort
    const tierOrder: Record<string, number> = { PREMIUM: 0, STANDARD: 1, BASIC: 2 };
    if (sort === "price-asc") {
      sponsored.sort((a: any, b: any) => a.sellingPrice - b.sellingPrice);
    } else if (sort === "price-desc") {
      sponsored.sort((a: any, b: any) => b.sellingPrice - a.sellingPrice);
    } else if (sort === "rating") {
      sponsored.sort((a: any, b: any) => b.rating - a.rating);
    } else {
      // Default: by tier then sort order
      sponsored.sort((a: any, b: any) => (tierOrder[a.planTier] ?? 3) - (tierOrder[b.planTier] ?? 3));
    }

    // Get unique categories for filters
    const categories = [...new Set(sponsored.map((p: any) => p.category))].sort();

    if (limit) sponsored = sponsored.slice(0, limit);

    return NextResponse.json({ products: sponsored, categories });
  } catch (error) {
    console.error("Sponsored products error:", error);
    return NextResponse.json({ products: [], categories: [] });
  }
}
