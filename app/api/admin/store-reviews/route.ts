import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET — list all reviews for a store (admin view)
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const storeId = new URL(req.url).searchParams.get("storeId");
  if (!storeId) return NextResponse.json({ error: "storeId required" }, { status: 400 });

  const reviews = await prisma.storeReview.findMany({
    where: { storeId },
    include: {
      buyer: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      sellerRepliedAt: r.sellerRepliedAt?.toISOString() ?? null,
    }))
  );
}

// POST — admin creates a review on behalf of a buyer (no order required)
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { clerkId } });
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json();
  const { storeId, buyerId, itemRating, communicationRating, shippingRating, comment } = body;

  if (!storeId || !buyerId || !itemRating || !communicationRating || !shippingRating) {
    return NextResponse.json({ error: "storeId, buyerId, and all 3 ratings are required" }, { status: 400 });
  }

  for (const r of [itemRating, communicationRating, shippingRating]) {
    if (r < 1 || r > 5 || !Number.isInteger(r)) {
      return NextResponse.json({ error: "Ratings must be integers 1-5" }, { status: 400 });
    }
  }

  // Verify buyer exists
  const buyer = await prisma.user.findUnique({ where: { id: buyerId }, select: { id: true, role: true } });
  if (!buyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 });

  // Verify store exists
  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { id: true } });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const overallRating = parseFloat(((itemRating + communicationRating + shippingRating) / 3).toFixed(2));

  // Generate a unique fake orderId for admin-created reviews
  const fakeOrderId = `admin-review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const review = await prisma.$transaction(async (tx) => {
    const newReview = await tx.storeReview.create({
      data: {
        storeId,
        buyerId,
        orderId: fakeOrderId,
        itemRating,
        communicationRating,
        shippingRating,
        overallRating,
        comment: comment?.trim() || null,
      },
    });

    // Recalculate store averages
    const agg = await tx.storeReview.aggregate({
      where: { storeId },
      _avg: { overallRating: true, itemRating: true, communicationRating: true, shippingRating: true },
      _count: true,
    });

    await tx.store.update({
      where: { id: storeId },
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

// DELETE — admin deletes a review
export async function DELETE(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { clerkId } });
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const reviewId = new URL(req.url).searchParams.get("reviewId");
  if (!reviewId) return NextResponse.json({ error: "reviewId required" }, { status: 400 });

  const review = await prisma.storeReview.findUnique({ where: { id: reviewId }, select: { storeId: true } });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.storeReview.delete({ where: { id: reviewId } });

    // Recalculate store averages
    const agg = await tx.storeReview.aggregate({
      where: { storeId: review.storeId },
      _avg: { overallRating: true, itemRating: true, communicationRating: true, shippingRating: true },
      _count: true,
    });

    await tx.store.update({
      where: { id: review.storeId },
      data: {
        averageRating: agg._count > 0 && agg._avg.overallRating ? parseFloat(agg._avg.overallRating.toFixed(2)) : null,
        totalReviews: agg._count,
        itemRatingAvg: agg._count > 0 && agg._avg.itemRating ? parseFloat(agg._avg.itemRating.toFixed(2)) : null,
        commsRatingAvg: agg._count > 0 && agg._avg.communicationRating ? parseFloat(agg._avg.communicationRating.toFixed(2)) : null,
        shippingRatingAvg: agg._count > 0 && agg._avg.shippingRating ? parseFloat(agg._avg.shippingRating.toFixed(2)) : null,
      },
    });
  });

  return NextResponse.json({ success: true });
}
