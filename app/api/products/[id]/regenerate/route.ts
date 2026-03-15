import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const systemPrompt = `You are a senior e-commerce copywriter who has written thousands of product listings for Amazon, AliExpress, and Shopify stores. You write descriptions that are compelling, benefit-focused, and optimized for conversions. You never use generic filler phrases like "look no further" or "whether you're a beginner or pro". Your writing is specific, sensory, and makes the reader feel the product.`;

// POST /api/products/[id]/regenerate
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let extraInstructions = "";
  try {
    const body = await req.json();
    extraInstructions = body?.instructions ?? "";
  } catch {
    // No body, that's fine
  }

  const userPrompt = `Generate a product listing for the following product.
${extraInstructions ? `\nSPECIAL INSTRUCTIONS: ${extraInstructions}\n` : ""}
PRODUCT INFO:
- Name: ${product.title}
- Brand: ${product.brand ?? "Unbranded"}
- Category: ${product.category}
- Price: $${product.price}
- Rating: ${product.rating}/5
- Tags: ${(product.tags ?? []).join(", ") || "none"}
- Current Description: ${product.originalDescription ?? product.description}
- Weight: ${product.weight ?? "N/A"}g
- Warranty: ${product.warrantyInformation ?? "N/A"}
- Return Policy: ${product.returnPolicy ?? "N/A"}
- Shipping: ${product.shippingInformation ?? "N/A"}

Respond in EXACTLY this format with no extra text:

MAIN_DESCRIPTION:
Write 2-3 engaging paragraphs (150-220 words total). Lead with the strongest benefit. Use sensory and emotional language. Mention the brand naturally if it exists. Include subtle social proof (reference the rating). End with a soft call-to-action. Think Amazon Best Seller listing quality.

SHORT_DESCRIPTION:
Write exactly 1 sentence (15-25 words). This is a punchy tagline for product cards and search results. Make it benefit-driven and specific.

KEY_FEATURES:
Write exactly 8 unique bullet points, each covering a DIFFERENT aspect. Each must follow this format:
• BENEFIT_WORD — Concise explanation of the feature/benefit (10-20 words max)`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "";

    const mainMatch = text.match(/MAIN_DESCRIPTION:\s*([\s\S]*?)(?=SHORT_DESCRIPTION:)/);
    const shortMatch = text.match(/SHORT_DESCRIPTION:\s*([\s\S]*?)(?=KEY_FEATURES:)/);
    const keyMatch = text.match(/KEY_FEATURES:\s*([\s\S]*?)$/);

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        description: mainMatch?.[1]?.trim() ?? product.description,
        shortDescription: shortMatch?.[1]?.trim() || null,
        keyFeatures: keyMatch?.[1]?.trim() || null,
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("Regenerate failed:", error);
    return NextResponse.json(
      { error: "Failed to regenerate description" },
      { status: 500 }
    );
  }
}
