import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs";
import * as path from "path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ── Fix AliExpress URL to a usable format ──
function cleanAliExpressUrl(url: string): string {
  let clean = url.trim();
  // Remove query params and avif suffix patterns
  // Pattern: .jpg?has_lang=1&ver=2_220x220q75.jpg_.avif → .jpg
  // Pattern: .jpg_220x220q75.jpg_.avif → .jpg
  // Pattern: .png_220x220.png_.avif → .png
  clean = clean.replace(/\.(jpg|jpeg|png|webp)(\?[^_]*)?(_\d+x\d+q?\d*\.\w+)?(_\.avif)?$/i, ".$1");
  // If it still ends with .avif, strip it
  clean = clean.replace(/\.avif$/, "");
  // If it still has _220x220 patterns, strip them
  clean = clean.replace(/_\d+x\d+q?\d*/, "");
  return clean;
}

async function uploadToCloudinary(imageUrl: string, folder: string, publicId: string): Promise<string | null> {
  // Try the cleaned URL first, then the original
  const cleanedUrl = cleanAliExpressUrl(imageUrl);
  const urlsToTry = [cleanedUrl];
  if (cleanedUrl !== imageUrl.trim()) urlsToTry.push(imageUrl.trim());

  for (const url of urlsToTry) {
    try {
      const result = await cloudinary.uploader.upload(url, {
        folder: `markethub/${folder}`,
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
        transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
      });
      return result.secure_url;
    } catch (err: any) {
      // Try next URL variant
      continue;
    }
  }

  // Last resort: try fetching the URL directly and uploading from buffer
  try {
    const response = await fetch(imageUrl.trim());
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(base64, {
        folder: `markethub/${folder}`,
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
        transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
      });
      return result.secure_url;
    }
  } catch {
    // All methods failed
  }

  console.error(`  ⚠️ All upload methods failed for: ${imageUrl.slice(0, 80)}...`);
  return null;
}

async function main() {
  // Find products with placeholder images (non-Cloudinary URLs) above ID 194 (imported products)
  const products = await prisma.product.findMany({
    where: { id: { gt: 194 } },
    orderBy: { id: "asc" },
    select: { id: true, title: true, thumbnail: true, images: true, category: true },
  });

  const cloudinaryDomain = "res.cloudinary.com";
  const needsFix = products.filter(
    (p) => !p.thumbnail || !p.thumbnail.includes(cloudinaryDomain)
  );

  console.log(`Found ${needsFix.length} imported products with broken/placeholder images (out of ${products.length}).\n`);

  if (needsFix.length === 0) {
    console.log("✅ All imported products already have Cloudinary URLs!");
    return;
  }

  // Load the original JSON to get the source AliExpress image URLs
  const jsonPath = path.join(__dirname, "..", "products.json");
  let originalProducts: Array<{ title: string; images?: string[]; category: string }> = [];
  try {
    const { execSync } = require("child_process");
    const fixerScript = path.join(__dirname, "fix-json.py");
    const fixed = execSync(`python3 "${fixerScript}" "${jsonPath}"`, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });
    originalProducts = JSON.parse(fixed);
  } catch (err) {
    console.error("Failed to load products.json, will try re-uploading from stored URLs");
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < needsFix.length; i++) {
    const p = needsFix[i];
    const progress = `[${i + 1}/${needsFix.length}]`;
    console.log(`${progress} 📷 "${p.title}" (ID: ${p.id})...`);

    // Find matching product in original JSON by title
    const originalIdx = originalProducts.findIndex(
      (op) => op.title.trim().toLowerCase() === p.title.trim().toLowerCase()
    );
    const sourceImages = originalIdx >= 0
      ? (originalProducts[originalIdx].images ?? [])
      : (p.images ?? []).filter((u) => !u.includes("placehold.co"));

    if (sourceImages.length === 0) {
      console.log(`${progress} ⚠️ No source images found, skipping`);
      failed++;
      continue;
    }

    // Upload all images
    const uploadedUrls: string[] = [];
    for (let j = 0; j < sourceImages.length; j++) {
      console.log(`  Uploading image ${j + 1}/${sourceImages.length}...`);
      const url = await uploadToCloudinary(
        sourceImages[j],
        p.category,
        `product-${p.id}-img-${j}`
      );
      if (url) {
        uploadedUrls.push(url);
        console.log(`  ✅ Image ${j + 1} uploaded`);
      } else {
        console.log(`  ❌ Image ${j + 1} failed`);
      }
      await new Promise((r) => setTimeout(r, 300));
    }

    if (uploadedUrls.length > 0) {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          thumbnail: uploadedUrls[0],
          images: uploadedUrls,
        },
      });
      console.log(`${progress} ✅ Updated with ${uploadedUrls.length} Cloudinary images`);
      success++;
    } else {
      console.log(`${progress} ❌ All image uploads failed`);
      failed++;
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n🎉 Done! ${success} fixed, ${failed} still broken.\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
