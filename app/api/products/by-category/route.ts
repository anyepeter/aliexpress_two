import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products/by-category?categories=smartphones,laptops&limit=100
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const categoriesParam = sp.get("categories") || "";
  const limit = Math.min(parseInt(sp.get("limit") ?? "100"), 500);

  const categories = categoriesParam
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  if (categories.length === 0) {
    return NextResponse.json({ products: [], total: 0 });
  }

  try {
    const products = await prisma.product.findMany({
      where: { category: { in: categories } },
      take: limit,
      orderBy: { id: "asc" },
    });

    // Map to DummyProduct shape for compatibility with seller wizard
    const mapped = products.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      discountPercentage: p.discountPercentage ?? 0,
      rating: p.rating ?? 0,
      stock: p.stock ?? 0,
      brand: p.brand ?? undefined,
      category: p.category,
      thumbnail: p.thumbnail ?? "",
      images: p.images ?? [],
      tags: p.tags ?? [],
    }));

    return NextResponse.json({ products: mapped, total: mapped.length });
  } catch {
    return NextResponse.json({ products: [], total: 0 });
  }
}
