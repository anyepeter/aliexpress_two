import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import OpenAI from "openai";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const SYSTEM_PROMPT = `You are a product listing copywriter for AliExpress and Alibaba. You write product descriptions EXACTLY like real AliExpress sellers do — practical, specification-focused, and conversion-optimized in the Chinese-to-English marketplace style.

STRICT RULES — follow these precisely:

STRUCTURE (in this exact order):
1. Opening line: "[Product Name] — [1 sentence describing what it is and primary material/feature]"
2. Specification block: List 4-8 specs as "▸ Material: ..." / "▸ Size: ..." / "▸ Weight: ..." / "▸ Color: ..." / "▸ Compatibility: ..." etc.
3. Features section: 4-6 short paragraphs, each starting with a bracketed label like 【Premium Quality】or 【Easy to Use】
4. "Suitable for:" line listing 4-6 use cases separated by commas
5. "Package Includes:" line listing exactly what the buyer receives
6. "Note:" line with 1-2 practical disclaimers (color variance due to monitor, manual measurement 1-3cm error, etc.)

LANGUAGE STYLE — use these EXACT AliExpress phrasing patterns:
- "Made of high-quality [material], durable and long-lasting"
- "Lightweight and portable, easy to carry"
- "Ergonomic design, comfortable to use"
- "Exquisite workmanship, fine stitching/finish"
- "Wide application, suitable for..."
- "A perfect gift for family, friends, colleagues"
- "Fashion/trendy design, matches with various styles"
- "Easy to clean/maintain, saves your time"
- "Anti-slip/anti-scratch/anti-fingerprint design"
- "Upgraded version, better performance than previous models"
- Use "approx." before measurements
- Use actual numbers: dimensions, weight, capacity, battery life

FORBIDDEN WORDS — never use any of these:
- "elevate", "imagine", "unleash", "game-changer", "revolutionary", "stunning"
- "look no further", "whether you're a beginner or pro", "take your X to the next level"
- "seamlessly", "effortlessly", "nestled", "tapestry", "symphony"
- "transcend", "paradigm", "synergy", "leverage", "curated"
- "unparalleled", "unmatched", "second to none"
- "embark on a journey", "redefine", "transform your"
- Any sentence starting with "Experience the..." or "Discover the..."
- Any metaphors, analogies, or emotional storytelling
- "but wait, there's more" or infomercial language

TONE:
- Factual, direct, practical — like a factory specification sheet with light marketing
- Write as if English is your second language (natural AliExpress style) — slightly formal, occasionally stiff phrasing
- Focus on WHAT IT IS and WHAT IT DOES, not how it makes you feel
- Short sentences. Often fragments. Very scannable.

The description should read like it was written by a Chinese seller who is good at English but writes in a distinctly AliExpress way.`;

const SHORT_DESC_INSTRUCTIONS = `Write an AliExpress-style product card tagline (15-30 words). It should read like a real AliExpress product title/subtitle:
- Pack keywords: material, feature, use case
- Use comma separation, not full sentences
- Example: "2024 New Wireless Bluetooth Earbuds, Active Noise Cancelling, 30H Playtime, IPX5 Waterproof, Touch Control, Built-in Mic"
- Example: "Premium Stainless Steel Water Bottle, Double Wall Vacuum Insulated, Keeps Hot 12H Cold 24H, Leak-Proof, BPA-Free, 500ml"
- No flowery language. Keywords and specs only.`;

const KEY_FEATURES_INSTRUCTIONS = `Write exactly 8 key features in AliExpress bracket format. Each feature MUST use this format:

【Label】Description in 10-20 words. Practical and specific.

Example output:
【Premium Material】Made of high-quality 304 stainless steel, BPA-free, safe and healthy for daily use
【Large Capacity】500ml/17oz capacity, enough water for gym, office, or outdoor activities
【Double Wall Insulation】Vacuum insulated design keeps drinks hot for 12 hours, cold for 24 hours
【Leak-Proof Design】Upgraded silicone seal ring prevents any leaking, safe to put in your bag
【Wide Mouth Opening】Easy to add ice cubes, easy to clean, compatible with most cup holders
【Lightweight & Portable】Only 280g, with carrying loop for convenient one-hand carrying
【Multiple Occasions】Perfect for gym, office, school, camping, hiking, travel, and daily use
【Ideal Gift Choice】Elegant packaging, a perfect gift for birthday, Christmas, Valentine's Day

Rules:
- Use 【】brackets, NOT bullet points
- Be specific with numbers, materials, measurements
- Each feature covers a DIFFERENT aspect
- Sound like AliExpress, not Amazon`;

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
      stock: true,
      tags: true,
      originalDescription: true,
      description: true,
      weight: true,
      warrantyInformation: true,
      returnPolicy: true,
      shippingInformation: true,
      sku: true,
      availabilityStatus: true,
      minimumOrderQuantity: true,
    },
  });

  console.log(`\n🔄 Rewriting ${products.length} product descriptions in AliExpress style...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const progress = `[${i + 1}/${products.length}]`;

    console.log(`${progress} ✍️  "${p.title}"...`);

    try {
      const userPrompt = `Write an AliExpress/Alibaba product listing for this product:

PRODUCT DATA:
- Name: ${p.title}
- Brand: ${p.brand ?? "Generic"}
- Category: ${p.category}
- Price: $${p.price}
- Rating: ${p.rating ?? "N/A"}/5 (${Math.floor(Math.random() * 800 + 200)} reviews)
- Stock: ${p.stock ?? "In Stock"}
- Weight: ${p.weight ? p.weight + "g" : "N/A"}
- SKU: ${p.sku ?? "N/A"}
- Tags: ${(p.tags ?? []).join(", ") || "none"}
- Current Description: ${p.originalDescription ?? p.description}
- Warranty: ${p.warrantyInformation ?? "N/A"}
- Shipping: ${p.shippingInformation ?? "N/A"}
- Return Policy: ${p.returnPolicy ?? "N/A"}
- Min Order: ${p.minimumOrderQuantity ?? 1}

Respond in EXACTLY this format with no extra commentary:

MAIN_DESCRIPTION:
[Write the full AliExpress-style description following the structure rules: opening line, specs block with ▸, feature sections with 【】brackets, Suitable for line, Package Includes line, Note line. 180-280 words total.]

SHORT_DESCRIPTION:
${SHORT_DESC_INSTRUCTIONS}

KEY_FEATURES:
${KEY_FEATURES_INSTRUCTIONS}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 1500,
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });

      const text = response.choices[0]?.message?.content ?? "";

      // Parse sections
      const mainMatch = text.match(/MAIN_DESCRIPTION:\s*([\s\S]*?)(?=SHORT_DESCRIPTION:)/i);
      const shortMatch = text.match(/SHORT_DESCRIPTION:\s*([\s\S]*?)(?=KEY_FEATURES:)/i);
      const keyMatch = text.match(/KEY_FEATURES:\s*([\s\S]*?)$/i);

      const mainDesc = mainMatch?.[1]?.trim() ?? "";
      const shortDesc = shortMatch?.[1]?.trim() ?? "";
      const keyFeatures = keyMatch?.[1]?.trim() ?? "";

      if (!mainDesc || !shortDesc || !keyFeatures) {
        console.log(`${progress} ⚠️  Incomplete parse, retrying...`);
        // Try a simpler parse if markers aren't clean
        const lines = text.split("\n").filter((l) => l.trim());
        if (lines.length < 5) {
          console.log(`${progress} ❌ Failed to parse response`);
          failed++;
          continue;
        }
      }

      // Validate key features have 【】brackets
      const bracketCount = (keyFeatures.match(/【/g) || []).length;

      await prisma.product.update({
        where: { id: p.id },
        data: {
          description: mainDesc,
          shortDescription: shortDesc,
          keyFeatures: keyFeatures,
        },
      });

      console.log(`${progress} ✅ Done (desc: ${mainDesc.length} chars, features: ${bracketCount} items)`);
      success++;
    } catch (error: any) {
      console.error(`${progress} ❌ Error: ${error.message}`);
      failed++;
      // Wait longer on rate limit
      if (error.status === 429) {
        console.log(`${progress} ⏳ Rate limited, waiting 10s...`);
        await new Promise((r) => setTimeout(r, 10000));
      }
    }

    // Rate limit delay
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\n🎉 Complete! ${success} succeeded, ${failed} failed out of ${products.length} products.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
