import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products/categories
export async function GET() {
  try {
    const cats = await prisma.product.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    });
    const categories = cats.map((c) => ({
      slug: c.category,
      name: c.category
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      url: `/shop?category=${c.category}`,
    }));
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json([]);
  }
}
