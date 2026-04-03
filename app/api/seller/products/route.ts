import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { SellerProductForm } from "@/lib/types/sellerProduct";

// GET /api/seller/products — list all seller's products
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { store: { include: { sellerProducts: { orderBy: { sortOrder: "asc" } } } } },
  });

  if (!user?.store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json({ products: user.store.sellerProducts });
}

// POST /api/seller/products — bulk upsert products (from wizard)
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { store: true },
  });

  if (!user?.store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const { products }: { products: SellerProductForm[] } = await req.json();

  if (!Array.isArray(products) || products.length === 0) {
    return NextResponse.json({ error: "No products provided" }, { status: 400 });
  }

  const storeId = user.store.id;

  // Upsert each product
  const upserted = await Promise.all(
    products.map((p) =>
      prisma.sellerProduct.upsert({
        where: { storeId_dummyProductId: { storeId, dummyProductId: p.dummyProductId } },
        create: {
          storeId,
          dummyProductId: p.dummyProductId,
          title: p.title,
          description: p.description,
          images: p.images,
          category: p.category,
          brand: p.brand ?? null,
          basePrice: p.basePrice,
          marginPercent: p.marginPercent,
          sellingPrice: p.sellingPrice,
          discountPct: p.discountPct ?? 0,
          stock: p.stock,
          tags: p.tags ?? [],
          rating: p.rating ?? null,
          ratingCount: p.ratingCount ?? null,
          status: (p as any).status === "PUBLISHED" ? "PUBLISHED" : "ARCHIVED",
          publishedAt: (p as any).status === "PUBLISHED" ? new Date() : null,
          sortOrder: 0,
        },
        update: {
          title: p.title,
          description: p.description,
          images: p.images,
          category: p.category,
          brand: p.brand ?? null,
          basePrice: p.basePrice,
          marginPercent: p.marginPercent,
          sellingPrice: p.sellingPrice,
          discountPct: p.discountPct ?? 0,
          stock: p.stock,
          tags: p.tags ?? [],
          rating: p.rating ?? null,
          ratingCount: p.ratingCount ?? null,
          status: (p as any).status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
          publishedAt: (p as any).status === "PUBLISHED" ? new Date() : undefined,
          updatedAt: new Date(),
        },
      })
    )
  );

  return NextResponse.json({ products: upserted });
}
