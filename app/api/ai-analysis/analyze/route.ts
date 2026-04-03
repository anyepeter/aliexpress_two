import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST — run "AI analysis" (picks random products + fake predictions)
export async function POST() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { store: { select: { id: true } } },
  });
  if (!user || !user.store) return NextResponse.json({ error: "Not a seller" }, { status: 403 });

  // Verify active subscription
  const sub = await prisma.aiAnalysisSubscription.findFirst({
    where: { storeId: user.store.id, status: "ACTIVE" },
  });
  if (!sub) return NextResponse.json({ error: "No active AI Analysis subscription" }, { status: 403 });

  // Get total product count for random offset
  const totalProducts = await prisma.product.count();
  const skip = Math.max(0, Math.floor(Math.random() * (totalProducts - 10)));

  // Pick 10 random products
  const products = await prisma.product.findMany({
    select: { id: true, title: true, thumbnail: true, category: true, price: true },
    skip,
    take: 10,
    orderBy: { id: "asc" },
  });

  // Shuffle them
  const shuffled = products.sort(() => Math.random() - 0.5);

  // Check which products seller already has
  const existingProducts = await prisma.sellerProduct.findMany({
    where: { storeId: user.store.id },
    select: { dummyProductId: true },
  });
  const existingIds = new Set(existingProducts.map((p) => p.dummyProductId));

  // Generate fake predictions
  const predictions = shuffled.map((p) => ({
    id: p.id,
    title: p.title,
    thumbnail: p.thumbnail,
    category: p.category,
    price: p.price,
    predictedOrders: Math.floor(Math.random() * 6) + 5, // 5-10
    confidence: Math.floor(Math.random() * 21) + 75, // 75-95%
    trend: Math.random() > 0.3 ? "up" : "stable",
    inStore: existingIds.has(p.id),
  }));

  // Generate analysis messages
  const messages = [
    `Based on my market research this week, I analyzed ${totalProducts} products across all categories and identified the top trending items.`,
    `These ${predictions.length} products show strong demand signals. Sellers stocking these items typically see ${Math.floor(Math.random() * 6) + 5}-${Math.floor(Math.random() * 6) + 10} orders per product within the first week.`,
    `I recommend adding these products to your store to maximize your revenue this period. Products in the ${predictions[0]?.category ?? "general"} and ${predictions[1]?.category ?? "accessories"} categories are performing particularly well.`,
  ];

  return NextResponse.json({
    predictions,
    messages,
    analyzedAt: new Date().toISOString(),
    totalProductsAnalyzed: totalProducts,
  });
}
