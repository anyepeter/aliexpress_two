import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/store-products?storeId=xxx — List published products for a store with catalog data (admin only) */
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { clerkId } });
    if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const storeId = req.nextUrl.searchParams.get("storeId");
    if (!storeId) return NextResponse.json({ error: "storeId required" }, { status: 400 });

    const sellerProducts = await prisma.sellerProduct.findMany({
      where: { storeId, status: "PUBLISHED" },
      select: {
        id: true,
        dummyProductId: true,
        title: true,
        category: true,
        brand: true,
        basePrice: true,
        sellingPrice: true,
        discountPct: true,
        stock: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    // Enrich with thumbnails from the Product catalog table
    const dummyIds = sellerProducts.map((p) => p.dummyProductId);
    const catalogProducts = await prisma.product.findMany({
      where: { id: { in: dummyIds } },
      select: { id: true, thumbnail: true },
    });
    const thumbnailMap = new Map(catalogProducts.map((p) => [p.id, p.thumbnail]));

    const products = sellerProducts.map((p) => ({
      id: p.id,
      dummyProductId: p.dummyProductId,
      title: p.title,
      category: p.category,
      brand: p.brand,
      basePrice: p.basePrice,
      sellingPrice: p.sellingPrice,
      discountPct: p.discountPct,
      stock: p.stock,
      thumbnail: thumbnailMap.get(p.dummyProductId) ?? `https://cdn.dummyjson.com/product-images/${p.dummyProductId}/thumbnail.webp`,
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/admin/store-products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
