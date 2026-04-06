import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Old category → new { category, subcategory }
const CATEGORY_MAP: Record<string, { category: string; subcategory: string }> = {
  "mobile-accessories": { category: "electronics", subcategory: "phone-accessories" },
  "womens-dresses": { category: "womens-apparel", subcategory: "dresses" },
  "womens-shoes": { category: "womens-apparel", subcategory: "shoes" },
  "tops": { category: "womens-apparel", subcategory: "tops-blouses" },
  "womens-bags": { category: "bags-wallets", subcategory: "handbags" },
  "womens-jewellery": { category: "jewelry", subcategory: "earrings-necklaces" },
  "mens-watches": { category: "jewelry", subcategory: "watches" },
  "home-decoration": { category: "home-living", subcategory: "decor" },
  "kitchen-accessories": { category: "kitchen", subcategory: "utensils" },
  "sunglasses": { category: "fashion-accessories", subcategory: "sunglasses" },
  "sports-accessories": { category: "sports-fitness", subcategory: "gym-equipment" },
  "mens-shirts": { category: "mens-apparel", subcategory: "shirts" },
  "mens-shoes": { category: "mens-apparel", subcategory: "shoes" },
  "beauty": { category: "beauty-skincare", subcategory: "face-care" },
  "skin-care": { category: "beauty-skincare", subcategory: "face-care" },
  "fragrances": { category: "beauty-skincare", subcategory: "fragrances" },
  "groceries": { category: "home-living", subcategory: "pantry" },
};

async function main() {
  console.log("🔄 Remapping all product categories...\n");

  const products = await prisma.product.findMany({
    select: { id: true, category: true },
  });

  console.log(`Found ${products.length} products to remap.\n`);

  let updated = 0;
  let skipped = 0;
  const unmapped = new Set<string>();

  for (const product of products) {
    const mapping = CATEGORY_MAP[product.category];

    if (mapping) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          category: mapping.category,
          subcategory: mapping.subcategory,
        },
      });
      updated++;
    } else {
      // Already remapped or unknown category
      unmapped.add(product.category);
      skipped++;
    }
  }

  console.log(`✅ Updated: ${updated} products`);
  console.log(`⏭️  Skipped: ${skipped} products`);

  if (unmapped.size > 0) {
    console.log(`\n⚠️  Unmapped categories: ${[...unmapped].join(", ")}`);
  }

  // Print new distribution
  const newCats = await prisma.product.groupBy({
    by: ["category", "subcategory"],
    _count: true,
    orderBy: [{ category: "asc" }, { subcategory: "asc" }],
  });

  console.log("\n📊 New category distribution:\n");
  let currentCat = "";
  for (const c of newCats) {
    if (c.category !== currentCat) {
      const catTotal = newCats
        .filter((x) => x.category === c.category)
        .reduce((s, x) => s + x._count, 0);
      console.log(`\n  ${c.category} (${catTotal} total)`);
      currentCat = c.category;
    }
    console.log(`    └── ${c.subcategory ?? "(none)"}: ${c._count}`);
  }

  const total = await prisma.product.count();
  console.log(`\n📦 Total products: ${total}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
