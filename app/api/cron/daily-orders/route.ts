import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Secret to protect the cron endpoint
const CRON_SECRET = process.env.CRON_SECRET || "mh-cron-secret-2026";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MH-${y}${m}${d}-${suffix}`;
}

const REVIEW_COMMENTS = [
  "Absolutely love this product! Quality is amazing and it arrived so fast.",
  "Great store with excellent customer service. Items exactly as described.",
  "Impressed with the quality. Packaging was beautiful too. Highly recommend!",
  "Everything arrived in perfect condition. Very responsive seller. 5 stars!",
  "Best online shopping experience. Products are top-notch quality.",
  "Fast shipping, great communication, product exceeded expectations!",
  "This store never disappoints. Always satisfied with premium quality!",
  "The attention to detail is incredible. Looks even better than photos.",
  "Ordered as a gift and it was a huge hit! Beautiful packaging.",
  "Outstanding quality for the price. Best value compared to other stores.",
  "Exceptional customer service. Helped me choose the right product.",
  "Repeat customer — quality has been consistently excellent. My go-to store!",
  "Product quality is superb. Carefully curated items. Very happy!",
  "Shipping was faster than expected. Exactly what I needed.",
  "Was skeptical at first but this store delivered beyond expectations!",
  null,
  null,
];

export async function GET(req: NextRequest) {
  // Verify cron secret
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find the Cathy store (Dazzling Confidence)
    const store = await prisma.store.findUnique({
      where: { storeSlug: "dazzling-confidence" },
      include: {
        sellerProducts: {
          where: { status: "PUBLISHED" },
          select: {
            id: true,
            dummyProductId: true,
            title: true,
            sellingPrice: true,
            basePrice: true,
            discountPct: true,
            category: true,
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Get product thumbnails from Product table
    const dummyIds = store.sellerProducts.map((p) => p.dummyProductId);
    const productRecords = await prisma.product.findMany({
      where: { id: { in: dummyIds } },
      select: { id: true, thumbnail: true },
    });
    const thumbnailMap = new Map<number, string>(productRecords.map((p) => [p.id, p.thumbnail ?? ""]));

    // Get existing demo buyers
    const buyers = await prisma.user.findMany({
      where: { email: { endsWith: "@demo.test" }, role: "BUYER" },
      select: { id: true },
      take: 30,
    });

    if (buyers.length === 0) {
      return NextResponse.json({ error: "No demo buyers found" }, { status: 500 });
    }

    // Get buyer addresses
    const buyerIds = buyers.map((b) => b.id);
    const addresses = await prisma.address.findMany({
      where: { userId: { in: buyerIds } },
      select: { id: true, userId: true },
    });
    const addressMap = new Map(addresses.map((a) => [a.userId, a.id]));

    // Config: 5-10 orders per day, $5K-$10K total profit
    const orderCount = randomInt(5, 10);
    const targetProfit = randomInt(5000, 10000);
    const profitPerOrder = targetProfit / orderCount;

    const now = new Date();
    let totalRevenue = 0;
    let totalProfit = 0;
    const createdOrderIds: string[] = [];

    for (let i = 0; i < orderCount; i++) {
      const buyer = buyers[randomInt(0, buyers.length - 1)];
      const addressId = addressMap.get(buyer.id);
      if (!addressId) continue;

      // Pick 2-4 random products
      const itemCount = randomInt(2, 4);
      const shuffled = [...store.sellerProducts].sort(() => Math.random() - 0.5);
      const orderProducts = shuffled.slice(0, Math.min(itemCount, shuffled.length));

      if (orderProducts.length === 0) continue;

      // Calculate quantities to hit target profit per order
      const avgMargin = orderProducts.reduce((s, p) => s + (p.sellingPrice - p.basePrice), 0) / orderProducts.length;
      const baseQty = Math.max(1, Math.ceil(profitPerOrder / (avgMargin * orderProducts.length)));

      let subtotal = 0;
      let baseCost = 0;
      const items: {
        productId: string;
        dummyProductId: number;
        title: string;
        thumbnail: string;
        price: number;
        basePrice: number;
        discountPct: number;
        quantity: number;
        total: number;
      }[] = [];

      for (const sp of orderProducts) {
        const qty = baseQty + randomInt(-1, 2);
        const actualQty = Math.max(1, qty);
        const discountedPrice = sp.discountPct > 0
          ? Math.round(sp.sellingPrice * (1 - sp.discountPct / 100) * 100) / 100
          : sp.sellingPrice;
        const discountedBase = sp.discountPct > 0
          ? Math.round(sp.basePrice * (1 - sp.discountPct / 100) * 100) / 100
          : sp.basePrice;
        const lineTotal = Math.round(discountedPrice * actualQty * 100) / 100;
        const lineBase = Math.round(discountedBase * actualQty * 100) / 100;

        items.push({
          productId: sp.id,
          dummyProductId: sp.dummyProductId,
          title: sp.title,
          thumbnail: thumbnailMap.get(sp.dummyProductId) ?? "",
          price: discountedPrice,
          basePrice: discountedBase,
          discountPct: sp.discountPct,
          quantity: actualQty,
          total: lineTotal,
        });

        subtotal += lineTotal;
        baseCost += lineBase;
      }

      const profit = Math.round((subtotal - baseCost) * 100) / 100;

      // Randomize order time within today
      const orderTime = new Date(now);
      orderTime.setHours(randomInt(6, 22), randomInt(0, 59), randomInt(0, 59));

      const completedTime = new Date(orderTime.getTime() + randomInt(1, 6) * 3600000);

      const order = await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          buyerId: buyer.id,
          storeId: store.id,
          addressId,
          paymentMethod: Math.random() > 0.3 ? "BANK_TRANSFER" : "BITCOIN",
          status: "COMPLETED",
          subtotal,
          totalAmount: subtotal,
          baseCost,
          profit,
          sellerRevenue: subtotal,
          contactedAt: orderTime,
          shippingAt: new Date(orderTime.getTime() + randomInt(1, 3) * 3600000),
          completedAt: completedTime,
          createdAt: orderTime,
          items: { create: items },
        },
      });

      createdOrderIds.push(order.id);
      totalRevenue += subtotal;
      totalProfit += profit;

      // Create OrderAnalytics
      await prisma.orderAnalytics.create({
        data: {
          storeId: store.id,
          orderId: order.id,
          basePrice: baseCost,
          sellingPrice: subtotal,
          profit,
          category: orderProducts[0].category,
          productTitle: orderProducts[0].title,
          completedAt: completedTime,
        },
      });
    }

    // Update StoreAnalytics
    await prisma.storeAnalytics.update({
      where: { storeId: store.id },
      data: {
        totalOrders: { increment: createdOrderIds.length },
        totalRevenue: { increment: totalRevenue },
        totalProfit: { increment: totalProfit },
        totalViews: { increment: randomInt(200, 600) },
      },
    });

    // Create 2-4 reviews for some of today's orders
    const reviewCount = Math.min(randomInt(2, 4), createdOrderIds.length);
    let reviewsCreated = 0;

    for (let i = 0; i < reviewCount; i++) {
      const orderId = createdOrderIds[i];
      const buyer = buyers[randomInt(0, buyers.length - 1)];
      const itemRating = randomInt(4, 5);
      const communicationRating = randomInt(4, 5);
      const shippingRating = randomInt(3, 5);
      const overallRating = Math.round(((itemRating + communicationRating + shippingRating) / 3) * 10) / 10;

      try {
        await prisma.storeReview.create({
          data: {
            storeId: store.id,
            buyerId: buyer.id,
            orderId,
            itemRating,
            communicationRating,
            shippingRating,
            overallRating,
            comment: REVIEW_COMMENTS[randomInt(0, REVIEW_COMMENTS.length - 1)],
          },
        });
        reviewsCreated++;
      } catch {
        // Skip if review already exists for this order
      }
    }

    // Update store review count
    if (reviewsCreated > 0) {
      await prisma.store.update({
        where: { id: store.id },
        data: { totalReviews: { increment: reviewsCreated } },
      });
    }

    return NextResponse.json({
      success: true,
      date: now.toISOString().split("T")[0],
      orders: createdOrderIds.length,
      revenue: Math.round(totalRevenue),
      profit: Math.round(totalProfit),
      reviews: reviewsCreated,
      viewsAdded: true,
    });
  } catch (error: any) {
    console.error("Daily orders cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
