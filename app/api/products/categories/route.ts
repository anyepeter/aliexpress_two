import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Display name mapping for categories and subcategories
const CATEGORY_LABELS: Record<string, string> = {
  electronics: "Electronics",
  "womens-apparel": "Women's Apparel",
  "mens-apparel": "Men's Apparel",
  "home-living": "Home & Living",
  jewelry: "Jewelry",
  "beauty-skincare": "Beauty & Skincare",
  "fashion-accessories": "Fashion Accessories",
  "bags-wallets": "Bags & Wallets",
  kitchen: "Kitchen",
  "sports-fitness": "Sports & Fitness",
  "tiktok-trending": "TikTok Trending",
  "pet-supplies": "Pet Supplies",
  "baby-kids": "Baby & Kids",
  "auto-accessories": "Auto Accessories",
  "stationery-office": "Stationery & Office",
  "hardware-tools": "Hardware & Tools",
};

function toDisplayName(slug: string): string {
  return (
    CATEGORY_LABELS[slug] ??
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

// GET /api/products/categories
export async function GET() {
  try {
    // Get all distinct category + subcategory pairs with counts
    const grouped = await prisma.product.groupBy({
      by: ["category", "subcategory"],
      _count: true,
      orderBy: [{ category: "asc" }, { subcategory: "asc" }],
    });

    // Build nested structure
    const categoryMap = new Map<
      string,
      { slug: string; name: string; count: number; subcategories: { slug: string; name: string; count: number }[] }
    >();

    for (const row of grouped) {
      const catSlug = row.category;
      if (!categoryMap.has(catSlug)) {
        categoryMap.set(catSlug, {
          slug: catSlug,
          name: toDisplayName(catSlug),
          count: 0,
          subcategories: [],
        });
      }
      const cat = categoryMap.get(catSlug)!;
      cat.count += row._count;

      if (row.subcategory) {
        cat.subcategories.push({
          slug: row.subcategory,
          name: toDisplayName(row.subcategory),
          count: row._count,
        });
      }
    }

    const categories = [...categoryMap.values()].sort((a, b) => b.count - a.count);

    return NextResponse.json(categories);
  } catch {
    return NextResponse.json([]);
  }
}
