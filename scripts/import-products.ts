import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ── Types ──
interface ProductInput {
  title: string;
  category: string;
  subcategory?: string;
  price: number;
  brand: string;
  features?: string;
  images?: string[];
}

// ── Upload image to Cloudinary ──
function cleanAliExpressUrl(url: string): string {
  let clean = url.trim();
  // Remove query params first: .jpg?has_lang=1&ver=2_220x220q75.jpg_.avif → .jpg_220x220q75.jpg_.avif
  clean = clean.replace(/\?[^_]*(?=_\d+x\d+)/, "");
  // Strip everything after the real extension: .jpg_220x220q75.jpg_.avif → .jpg
  // .png_220x220.png_.avif → .png
  clean = clean.replace(/(\.(jpg|jpeg|png|webp))_\d+x\d+[^.]*(\.(?:jpg|jpeg|png|webp))?_?\.?(?:avif)?$/i, "$1");
  // If still ends with .avif, remove it
  clean = clean.replace(/\.avif$/, "");
  return clean;
}

async function uploadToCloudinary(imageUrl: string, folder: string): Promise<string | null> {
  const cleanUrl = cleanAliExpressUrl(imageUrl);
  const urlsToTry = [cleanUrl];
  if (cleanUrl !== imageUrl.trim()) urlsToTry.push(imageUrl.trim());

  for (const url of urlsToTry) {
    try {
      const result = await cloudinary.uploader.upload(url, {
        folder: `markethub/${folder}`,
        transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
      });
      return result.secure_url;
    } catch {
      continue;
    }
  }

  // Last resort: fetch the original URL and upload as base64
  try {
    const resp = await fetch(imageUrl.trim());
    if (resp.ok) {
      const buf = Buffer.from(await resp.arrayBuffer());
      const b64 = `data:image/jpeg;base64,${buf.toString("base64")}`;
      const result = await cloudinary.uploader.upload(b64, {
        folder: `markethub/${folder}`,
        resource_type: "image",
        transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
      });
      return result.secure_url;
    }
  } catch {
    // all methods failed
  }

  console.error(`  ⚠️ Failed to upload ${imageUrl.slice(0, 60)}...`);
  return null;
}

// ── Generate AI description ──
async function generateDescription(product: ProductInput): Promise<{
  description: string;
  shortDescription: string;
  keyFeatures: string;
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1500,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `You are a product listing copywriter for AliExpress. Write practical, specification-focused descriptions in AliExpress marketplace style. Use bracket format for features. No flowery language. Structure: opening line, specs with ▸ markers, feature sections with 【】brackets, Suitable for line, Package Includes line, Note line.`,
      },
      {
        role: "user",
        content: `Write an AliExpress product listing for:
- Name: ${product.title.trim()}
- Brand: ${product.brand.trim()}
- Category: ${product.category}
- Price: $${product.price}
${product.features ? `- Known Features: ${product.features}` : ""}

Respond in EXACTLY this format:

MAIN_DESCRIPTION:
[180-280 words, AliExpress style with ▸ specs and 【】feature sections]

SHORT_DESCRIPTION:
[15-30 word keyword tagline, AliExpress card style]

KEY_FEATURES:
[8 features in 【Label】Description format, use the provided features as base and expand]`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "";
  const mainMatch = text.match(/MAIN_DESCRIPTION:\s*([\s\S]*?)(?=SHORT_DESCRIPTION:)/i);
  const shortMatch = text.match(/SHORT_DESCRIPTION:\s*([\s\S]*?)(?=KEY_FEATURES:)/i);
  const keyMatch = text.match(/KEY_FEATURES:\s*([\s\S]*?)$/i);

  return {
    description: mainMatch?.[1]?.trim() ?? `${product.title} - High quality product by ${product.brand}.`,
    shortDescription: shortMatch?.[1]?.trim() ?? product.title,
    keyFeatures: keyMatch?.[1]?.trim() ?? "",
  };
}

// ── Adjust price so that after discount the final price lands between $10-$100 ──
function adjustPrice(originalPrice: number, discountPct: number): number {
  const finalAfterDiscount = originalPrice * (1 - discountPct / 100);
  if (finalAfterDiscount >= 10 && finalAfterDiscount <= 100) {
    return originalPrice; // already in range
  }
  // Pick a random final price between $10-$100, then reverse-calculate the base price
  const targetFinal = parseFloat((Math.random() * 90 + 10).toFixed(2)); // $10-$100
  const basePrice = parseFloat((targetFinal / (1 - discountPct / 100)).toFixed(2));
  return basePrice;
}

// ── Generate realistic product metadata ──
function generateMeta(product: ProductInput, index: number) {
  const rating = parseFloat((3.5 + Math.random() * 1.5).toFixed(1)); // 3.5-5.0
  const stock = Math.floor(Math.random() * 451) + 50; // 50-500
  const discount = parseFloat((Math.random() * 20 + 5).toFixed(1)); // 5-25%
  const weight = parseFloat((Math.random() * 900 + 100).toFixed(0)); // 100-1000g
  const minOrder = Math.random() > 0.7 ? 2 : 1;
  const adjustedPrice = adjustPrice(product.price, discount);

  const warranties = ["1 Year Warranty", "6 Months Warranty", "No Warranty", "2 Year Warranty", "Lifetime Warranty"];
  const shipping = ["Ships in 1-2 business days", "Ships in 2-3 business days", "Free shipping", "Ships within 24 hours"];
  const returns = ["30 days free return", "15 days free return", "7 days return", "No return"];
  const availability = stock > 100 ? "In Stock" : stock > 20 ? "Low Stock" : "Few Items Left";

  const sku = `MH-${product.category.slice(0, 3).toUpperCase()}-${(196 + index).toString().padStart(4, "0")}`;

  // Generate fake reviews
  const reviewNames = ["Sarah M.", "James L.", "Maria G.", "David K.", "Emma W.", "Alex T.", "Lisa R.", "John P."];
  const reviewComments = [
    "Great quality for the price! Exactly as described.",
    "Fast shipping and good packaging. Very satisfied.",
    "Works perfectly. Would buy again.",
    "Good value for money. Recommended!",
    "Arrived quickly. Product matches the listing.",
  ];
  const numReviews = Math.floor(Math.random() * 4) + 1;
  const reviews = Array.from({ length: numReviews }, (_, i) => ({
    rating: Math.floor(Math.random() * 2) + 4, // 4-5
    comment: reviewComments[i % reviewComments.length],
    date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    reviewerName: reviewNames[i % reviewNames.length],
    reviewerEmail: `reviewer${i}@email.com`,
  }));

  return {
    rating,
    stock,
    adjustedPrice,
    discountPercentage: discount,
    weight,
    minimumOrderQuantity: minOrder,
    sku,
    warrantyInformation: warranties[Math.floor(Math.random() * warranties.length)],
    shippingInformation: shipping[Math.floor(Math.random() * shipping.length)],
    returnPolicy: returns[Math.floor(Math.random() * returns.length)],
    availabilityStatus: availability,
    tags: [product.category, product.brand.trim().toLowerCase(), "new-arrival", "trending"],
    reviews: JSON.parse(JSON.stringify(reviews)),
    meta: { barcode: `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`, qrCode: `https://markethub.com/p/${sku}` },
  };
}

// ── Main ──
async function main() {
  const inputPath = process.argv[2] || "/home/chendi/Desktop/Projects/aliexpress_two/products.json";
  // Fix malformed JSON: literal newlines in strings + trailing commas
  const { execSync } = require("child_process");
  const fixerScript = require("path").join(__dirname, "fix-json.py");
  const fixed = execSync(`python3 "${fixerScript}" "${inputPath}"`, {
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
  });
  const products: ProductInput[] = JSON.parse(fixed);

  // Get the current max product ID
  const maxProduct = await prisma.product.findFirst({ orderBy: { id: "desc" }, select: { id: true } });
  let nextId = (maxProduct?.id ?? 195) + 1;

  console.log(`\n📦 Importing ${products.length} products (starting at ID ${nextId})...\n`);

  // Generate brands for products with empty brands
  const emptyBrandProducts = products.filter((p) => !p.brand || p.brand.trim() === "");
  const brandMap = new Map<number, string>();
  if (emptyBrandProducts.length > 0) {
    console.log(`🏷️  Generating brands for ${emptyBrandProducts.length} products...\n`);
    try {
      const brandList = emptyBrandProducts.map((p, i) => `${i}: "${p.title.trim()}" (${p.category})`).join("\n");
      const brandResp = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 1024,
        messages: [
          { role: "system", content: "Generate realistic fashion brand names for products. Short stylish names (1-2 words)." },
          { role: "user", content: `Generate a brand name for each product. Respond with ONLY lines like: 0:BrandName\n\n${brandList}` },
        ],
      });
      const brandText = brandResp.choices[0]?.message?.content ?? "";
      for (const line of brandText.trim().split("\n")) {
        const m = line.match(/^(\d+)\s*:\s*(.+)$/);
        if (m) {
          const idx = parseInt(m[1]);
          if (idx < emptyBrandProducts.length) {
            // Map original product index in the full array
            const origIdx = products.indexOf(emptyBrandProducts[idx]);
            brandMap.set(origIdx, m[2].trim());
          }
        }
      }
      console.log(`  ✅ Generated ${brandMap.size} brands\n`);
    } catch {
      console.log(`  ⚠️ Brand generation failed, using fallback\n`);
    }
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productId = nextId + i;
    const progress = `[${i + 1}/${products.length}]`;

    // Fill in brand if empty
    if (!product.brand || product.brand.trim() === "") {
      product.brand = brandMap.get(i) ?? "StyleVogue";
    }

    console.log(`${progress} 📷 "${product.title.trim()}" (${product.brand})...`);

    // 1. Upload images to Cloudinary
    const cloudinaryUrls: string[] = [];
    if (product.images && product.images.length > 0) {
      for (let j = 0; j < product.images.length; j++) {
        console.log(`  Uploading image ${j + 1}/${product.images.length}...`);
        const url = await uploadToCloudinary(product.images[j], product.category);
        if (url) cloudinaryUrls.push(url);
      }
    }

    if (cloudinaryUrls.length === 0) {
      console.log(`  ⚠️ No images uploaded, using placeholder`);
      cloudinaryUrls.push(`https://placehold.co/800x800/f0f0f0/999?text=${encodeURIComponent(product.title.trim().slice(0, 20))}`);
    }

    console.log(`  ✅ ${cloudinaryUrls.length} images uploaded`);

    // 2. Generate AI description
    console.log(`  🤖 Generating description...`);
    let aiContent;
    try {
      aiContent = await generateDescription(product);
    } catch (error: any) {
      console.error(`  ❌ AI generation failed: ${error.message}`);
      aiContent = {
        description: `${product.title.trim()} by ${product.brand.trim()}. High quality product.`,
        shortDescription: product.title.trim(),
        keyFeatures: product.features ?? "",
      };
    }

    // 3. Generate metadata
    const meta = generateMeta(product, i);

    // 4. Save to database
    try {
      await prisma.product.create({
        data: {
          id: productId,
          title: product.title.trim(),
          description: aiContent.description,
          shortDescription: aiContent.shortDescription,
          keyFeatures: aiContent.keyFeatures,
          originalDescription: product.features ?? null,
          price: meta.adjustedPrice,
          discountPercentage: meta.discountPercentage,
          rating: meta.rating,
          stock: meta.stock,
          brand: product.brand.trim(),
          category: product.category,
          subcategory: product.subcategory ?? null,
          thumbnail: cloudinaryUrls[0],
          images: cloudinaryUrls,
          tags: meta.tags,
          sku: meta.sku,
          weight: meta.weight,
          warrantyInformation: meta.warrantyInformation,
          shippingInformation: meta.shippingInformation,
          availabilityStatus: meta.availabilityStatus,
          returnPolicy: meta.returnPolicy,
          minimumOrderQuantity: meta.minimumOrderQuantity,
          reviews: meta.reviews,
          meta: meta.meta,
        },
      });
      console.log(`  ✅ Saved as product #${productId}`);
      success++;
    } catch (error: any) {
      console.error(`  ❌ DB save failed: ${error.message}`);
      failed++;
    }

    // Rate limit delay
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n🎉 Done! ${success} imported, ${failed} failed. IDs: ${nextId}-${nextId + products.length - 1}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
