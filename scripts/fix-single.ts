import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import OpenAI from "openai";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

async function main() {
  const p = await prisma.product.findFirst({
    where: { title: { contains: "Green Oval Earring" } },
  });
  if (!p) { console.log("Product not found"); return; }

  console.log(`Fixing: ${p.id} "${p.title}"...`);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1500,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: "You are a product listing copywriter for AliExpress. Write practical, specification-focused product descriptions in the Chinese-to-English marketplace style. Use bracket format for features. No flowery language.",
      },
      {
        role: "user",
        content: `Write an AliExpress product listing for: Green Oval Earring, Womens Jewellery, $30.

Respond in this format:

MAIN_DESCRIPTION:
Opening line, specs with markers, 4-6 feature sections with brackets, Suitable for line, Package Includes line, Note line. 180-250 words.

SHORT_DESCRIPTION:
AliExpress-style keyword tagline, 15-30 words.

KEY_FEATURES:
8 features in bracket format like: Material: Made of high-quality alloy and crystal, nickel-free, hypoallergenic`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "";
  const mainMatch = text.match(/MAIN_DESCRIPTION:\s*([\s\S]*?)(?=SHORT_DESCRIPTION:)/i);
  const shortMatch = text.match(/SHORT_DESCRIPTION:\s*([\s\S]*?)(?=KEY_FEATURES:)/i);
  const keyMatch = text.match(/KEY_FEATURES:\s*([\s\S]*?)$/i);

  await prisma.product.update({
    where: { id: p.id },
    data: {
      description: mainMatch?.[1]?.trim() ?? p.description,
      shortDescription: shortMatch?.[1]?.trim() ?? p.shortDescription,
      keyFeatures: keyMatch?.[1]?.trim() ?? p.keyFeatures,
    },
  });

  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
