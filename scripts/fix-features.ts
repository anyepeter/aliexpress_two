import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import OpenAI from "openai";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

async function main() {
  const products = await prisma.product.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      title: true,
      brand: true,
      category: true,
      price: true,
      rating: true,
      tags: true,
      originalDescription: true,
      description: true,
      warrantyInformation: true,
      returnPolicy: true,
      shippingInformation: true,
      weight: true,
    },
  });

  console.log(`🔄 Regenerating key features (8 points) for ${products.length} products...\n`);

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const progress = `[${i + 1}/${products.length}]`;

    console.log(`${progress} 🤖 "${p.title}"...`);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 800,
        messages: [
          {
            role: "system",
            content:
              "You are a senior e-commerce copywriter. Generate exactly 8 unique, compelling key feature bullet points for product listings. Each feature must highlight a different benefit — no repetition. Cover aspects like quality, design, performance, value, convenience, durability, versatility, and user experience.",
          },
          {
            role: "user",
            content: `Generate exactly 8 unique key feature bullet points for this product:

- Name: ${p.title}
- Brand: ${p.brand ?? "Unbranded"}
- Category: ${p.category}
- Price: $${p.price}
- Rating: ${p.rating}/5
- Tags: ${(p.tags ?? []).join(", ") || "none"}
- Description: ${p.originalDescription ?? p.description}
- Weight: ${p.weight ?? "N/A"}g
- Warranty: ${p.warrantyInformation ?? "N/A"}
- Shipping: ${p.shippingInformation ?? "N/A"}

Each bullet must follow this format exactly:
• BENEFIT_WORD — Concise explanation of the feature/benefit (10-20 words max)

Example:
• DURABILITY — Military-grade aluminum frame withstands drops up to 6 feet without a scratch
• COMFORT — Ergonomic memory-foam grip reduces hand fatigue during extended use

Write 8 bullet points, each covering a DIFFERENT aspect. No filler, no repetition.`,
          },
        ],
      });

      const text = response.choices[0]?.message?.content ?? "";
      // Extract only the bullet lines
      const bullets = text
        .split("\n")
        .filter((line) => line.trim().startsWith("•"))
        .slice(0, 8)
        .join("\n");

      if (bullets) {
        await prisma.product.update({
          where: { id: p.id },
          data: { keyFeatures: bullets },
        });
        console.log(`${progress} ✅ Done (${bullets.split("\n").length} features)`);
      } else {
        console.log(`${progress} ⚠️  No bullets parsed, skipping`);
      }
    } catch (error) {
      console.error(`${progress} ❌ Failed:`, error);
    }

    // Rate limit
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log("\n🎉 All key features updated to 8 points!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
