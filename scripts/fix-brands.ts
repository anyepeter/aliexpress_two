import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import OpenAI from "openai";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

async function main() {
  // Find products without a brand
  const missing = await prisma.product.findMany({
    where: { OR: [{ brand: null }, { brand: "" }] },
    select: { id: true, title: true, category: true },
    orderBy: { id: "asc" },
  });

  console.log(`Found ${missing.length} products without a brand.\n`);

  if (missing.length === 0) {
    console.log("All products already have brands!");
    return;
  }

  // Build a single prompt to generate brands for all products at once
  const productList = missing
    .map((p) => `ID:${p.id} | "${p.title}" | Category: ${p.category}`)
    .join("\n");

  console.log("🤖 Generating brands for all products in one batch...\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    messages: [
      {
        role: "system",
        content:
          "You are a product catalog expert. Generate realistic, believable brand names for products that are missing them. Use existing real brands when appropriate (e.g., for generic items like 'Plant Pot' use a plausible brand like 'GreenLife'). For food items use real or realistic food brands. Keep brands short (1-3 words).",
      },
      {
        role: "user",
        content: `For each product below, generate a realistic brand name. Respond with ONLY lines in format: ID:brand_name (no quotes, no extra text)

${productList}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "";
  const lines = text.trim().split("\n");

  // Parse responses
  const brandMap = new Map<number, string>();
  for (const line of lines) {
    const match = line.match(/^ID:(\d+)[:\s]+(.+)$/i);
    if (match) {
      brandMap.set(parseInt(match[1]), match[2].trim());
    }
  }

  console.log(`Parsed ${brandMap.size} brand assignments.\n`);

  // Update each product
  for (const product of missing) {
    const brand = brandMap.get(product.id);
    if (brand) {
      await prisma.product.update({
        where: { id: product.id },
        data: { brand },
      });
      console.log(`✅ ${product.id}: "${product.title}" → ${brand}`);
    } else {
      // Fallback: use category-based brand
      const fallback =
        product.category
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join("") + " Co.";
      await prisma.product.update({
        where: { id: product.id },
        data: { brand: fallback },
      });
      console.log(
        `⚠️  ${product.id}: "${product.title}" → ${fallback} (fallback)`
      );
    }
  }

  console.log("\n🎉 All brands updated!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
