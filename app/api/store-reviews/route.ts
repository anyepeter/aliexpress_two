import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET — fetch reviews for a store (public) or check if buyer can review an order
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  const orderId = searchParams.get("orderId");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  // Check if buyer already reviewed this order
  if (orderId) {
    const existing = await prisma.storeReview.findUnique({
      where: { orderId },
    });
    return NextResponse.json({ reviewed: !!existing, review: existing });
  }

  if (!storeId) {
    return NextResponse.json({ error: "storeId required" }, { status: 400 });
  }

  const [reviews, total] = await Promise.all([
    prisma.storeReview.findMany({
      where: { storeId },
      include: {
        buyer: {
          select: { firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.storeReview.count({ where: { storeId } }),
  ]);

  // Get store rating summary
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: {
      averageRating: true,
      totalReviews: true,
      itemRatingAvg: true,
      commsRatingAvg: true,
      shippingRatingAvg: true,
      ratingOverride: true,
    },
  });

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      sellerRepliedAt: r.sellerRepliedAt?.toISOString() ?? null,
    })),
    total,
    hasMore: page * limit < total,
    summary: {
      displayRating: store?.ratingOverride ?? store?.averageRating ?? null,
      averageRating: store?.averageRating ?? null,
      totalReviews: store?.totalReviews ?? 0,
      itemRatingAvg: store?.itemRatingAvg ?? null,
      commsRatingAvg: store?.commsRatingAvg ?? null,
      shippingRatingAvg: store?.shippingRatingAvg ?? null,
    },
  });
}

// POST — buyer submits a review for a completed order
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "BUYER") {
    return NextResponse.json({ error: "Only buyers can submit reviews" }, { status: 403 });
  }

  const body = await req.json();
  const { orderId, itemRating, communicationRating, shippingRating, comment } = body;

  if (!orderId || !itemRating || !communicationRating || !shippingRating) {
    return NextResponse.json({ error: "All ratings are required" }, { status: 400 });
  }

  // Validate ratings are 1-5
  for (const r of [itemRating, communicationRating, shippingRating]) {
    if (r < 1 || r > 5 || !Number.isInteger(r)) {
      return NextResponse.json({ error: "Ratings must be integers 1-5" }, { status: 400 });
    }
  }

  // Verify the order exists, belongs to the buyer, and is COMPLETED
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, buyerId: true, storeId: true, status: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.buyerId !== user.id) return NextResponse.json({ error: "Not your order" }, { status: 403 });
  if (order.status !== "COMPLETED") return NextResponse.json({ error: "Order must be completed to review" }, { status: 400 });
  if (!order.storeId) return NextResponse.json({ error: "Order has no store" }, { status: 400 });

  // Check if already reviewed
  const existing = await prisma.storeReview.findUnique({ where: { orderId } });
  if (existing) return NextResponse.json({ error: "Already reviewed this order" }, { status: 409 });

  const overallRating = parseFloat(((itemRating + communicationRating + shippingRating) / 3).toFixed(2));

  // Create review and update store aggregates in a transaction
  const review = await prisma.$transaction(async (tx) => {
    const newReview = await tx.storeReview.create({
      data: {
        storeId: order.storeId!,
        buyerId: user.id,
        orderId,
        itemRating,
        communicationRating,
        shippingRating,
        overallRating,
        comment: comment?.trim() || null,
      },
    });

    // Recalculate store averages
    const agg = await tx.storeReview.aggregate({
      where: { storeId: order.storeId! },
      _avg: {
        overallRating: true,
        itemRating: true,
        communicationRating: true,
        shippingRating: true,
      },
      _count: true,
    });

    await tx.store.update({
      where: { id: order.storeId! },
      data: {
        averageRating: agg._avg.overallRating ? parseFloat(agg._avg.overallRating.toFixed(2)) : null,
        totalReviews: agg._count,
        itemRatingAvg: agg._avg.itemRating ? parseFloat(agg._avg.itemRating.toFixed(2)) : null,
        commsRatingAvg: agg._avg.communicationRating ? parseFloat(agg._avg.communicationRating.toFixed(2)) : null,
        shippingRatingAvg: agg._avg.shippingRating ? parseFloat(agg._avg.shippingRating.toFixed(2)) : null,
      },
    });

    return newReview;
  });

  return NextResponse.json(review, { status: 201 });
}

// PATCH — seller replies to a review
export async function PATCH(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { store: { select: { id: true } } },
  });
  if (!user || user.role !== "SELLER" || !user.store) {
    return NextResponse.json({ error: "Only sellers can reply to reviews" }, { status: 403 });
  }

  const body = await req.json();
  const { reviewId, sellerReply } = body;

  if (!reviewId || !sellerReply?.trim()) {
    return NextResponse.json({ error: "reviewId and sellerReply required" }, { status: 400 });
  }

  // Verify the review belongs to seller's store
  const review = await prisma.storeReview.findUnique({
    where: { id: reviewId },
    select: { id: true, storeId: true },
  });

  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  if (review.storeId !== user.store.id) {
    return NextResponse.json({ error: "Not your store's review" }, { status: 403 });
  }

  const updated = await prisma.storeReview.update({
    where: { id: reviewId },
    data: {
      sellerReply: sellerReply.trim(),
      sellerRepliedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
