import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import OpenAI from "openai";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

interface DummyProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  category: string;
  thumbnail: string;
  images: string[];
  tags?: string[];
  sku?: string;
  weight?: number;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  reviews?: Array<{
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }>;
  meta?: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
}

const systemPrompt = `You are a senior e-commerce copywriter who has written thousands of product listings for Amazon, AliExpress, and Shopify stores. You write descriptions that are compelling, benefit-focused, and optimized for conversions. You never use generic filler phrases like "look no further" or "whether you're a beginner or pro". Your writing is specific, sensory, and makes the reader feel the product.`;

function buildUserPrompt(p: DummyProduct): string {
  return `Generate a product listing for the following product.

PRODUCT INFO:
- Name: ${p.title}
- Brand: ${p.brand ?? "Unbranded"}
- Category: ${p.category}
- Price: $${p.price}
- Rating: ${p.rating}/5
- Tags: ${(p.tags ?? []).join(", ") || "none"}
- Current Description: ${p.description}
- Weight: ${p.weight ?? "N/A"}g
- Warranty: ${p.warrantyInformation ?? "N/A"}
- Return Policy: ${p.returnPolicy ?? "N/A"}
- Shipping: ${p.shippingInformation ?? "N/A"}

Respond in EXACTLY this format with no extra text:

MAIN_DESCRIPTION:
Write 2-3 engaging paragraphs (150-220 words total). Lead with the strongest benefit. Use sensory and emotional language. Mention the brand naturally if it exists. Include subtle social proof (reference the rating). End with a soft call-to-action. Think Amazon Best Seller listing quality.

SHORT_DESCRIPTION:
Write exactly 1 sentence (15-25 words). This is a punchy tagline for product cards and search results. Make it benefit-driven and specific.

KEY_FEATURES:
Write exactly 8 unique bullet points, each covering a DIFFERENT aspect. Each must follow this format:
• BENEFIT_WORD — Concise explanation of the feature/benefit (10-20 words max)
Example: • DURABILITY — Military-grade aluminum frame withstands drops up to 6 feet without a scratch`;
}

function parseAIResponse(text: string): {
  description: string;
  shortDescription: string;
  keyFeatures: string;
} {
  const mainMatch = text.match(
    /MAIN_DESCRIPTION:\s*([\s\S]*?)(?=SHORT_DESCRIPTION:)/
  );
  const shortMatch = text.match(
    /SHORT_DESCRIPTION:\s*([\s\S]*?)(?=KEY_FEATURES:)/
  );
  const keyMatch = text.match(/KEY_FEATURES:\s*([\s\S]*?)$/);

  return {
    description: mainMatch?.[1]?.trim() ?? text.trim(),
    shortDescription: shortMatch?.[1]?.trim() ?? "",
    keyFeatures: keyMatch?.[1]?.trim() ?? "",
  };
}

async function generateDescription(
  product: DummyProduct
): Promise<{ description: string; shortDescription: string; keyFeatures: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildUserPrompt(product) },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "";
    return parseAIResponse(text);
  } catch (error) {
    console.error(`  ❌ AI generation failed for "${product.title}":`, error);
    return {
      description: product.description,
      shortDescription: "",
      keyFeatures: "",
    };
  }
}

async function seedAdmin() {
  const existing = await prisma.user.findUnique({
    where: { email: "admin@markethub.com" },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        email: "admin@markethub.com",
        firstName: "Super",
        lastName: "Admin",
        role: "ADMIN",
        status: "ACTIVE",
        phone: "+1000000000",
        password: "no",
      },
    });
    console.log("✅ Default admin created: admin@markethub.com");
  } else {
    console.log("ℹ️  Admin already exists, skipping");
  }
}

async function seedProducts() {
  console.log("\n📦 Fetching all products from DummyJSON...");
  const res = await fetch("https://dummyjson.com/products?limit=0");
  if (!res.ok) {
    throw new Error(`Failed to fetch DummyJSON products: ${res.status}`);
  }
  const data = (await res.json()) as { products: DummyProduct[] };
  const products = data.products;
  console.log(`   Found ${products.length} products.\n`);

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const progress = `[${i + 1}/${products.length}]`;

    // Check if already seeded with AI description
    const existing = await prisma.product.findUnique({ where: { id: p.id } });
    if (existing && existing.shortDescription) {
      console.log(`${progress} ⏭  Skipping "${p.title}" (already seeded)`);
      continue;
    }

    console.log(`${progress} 🤖 Generating description for "${p.title}"...`);

    const ai = await generateDescription(p);

    const productData = {
      title: p.title,
      description: ai.description,
      shortDescription: ai.shortDescription || null,
      keyFeatures: ai.keyFeatures || null,
      originalDescription: p.description,
      price: p.price,
      discountPercentage: p.discountPercentage ?? null,
      rating: p.rating ?? null,
      stock: p.stock ?? null,
      brand: p.brand ?? null,
      category: p.category,
      thumbnail: p.thumbnail ?? null,
      images: p.images ?? [],
      tags: p.tags ?? [],
      sku: p.sku ?? null,
      weight: p.weight ?? null,
      warrantyInformation: p.warrantyInformation ?? null,
      shippingInformation: p.shippingInformation ?? null,
      availabilityStatus: p.availabilityStatus ?? null,
      returnPolicy: p.returnPolicy ?? null,
      minimumOrderQuantity: p.minimumOrderQuantity ?? null,
      reviews: p.reviews ? JSON.parse(JSON.stringify(p.reviews)) : null,
      meta: p.meta ? JSON.parse(JSON.stringify(p.meta)) : null,
    };

    await prisma.product.upsert({
      where: { id: p.id },
      update: productData,
      create: { id: p.id, ...productData },
    });

    console.log(`${progress} ✅ Done.`);

    // Rate limit delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(
    "\n🎉 Product seed complete! All products saved to the database."
  );
}

async function main() {
  console.log("🌱 Starting seed...\n");
  await seedAdmin();
  await seedProducts();
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
