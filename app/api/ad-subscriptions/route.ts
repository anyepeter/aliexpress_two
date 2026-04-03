import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET — seller's subscriptions
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { store: { select: { id: true } } },
  });
  if (!user || !user.store) return NextResponse.json({ error: "Not a seller" }, { status: 403 });

  const subscriptions = await prisma.adSubscription.findMany({
    where: { storeId: user.store.id },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(subscriptions.map((s) => ({
    ...s,
    startDate: s.startDate?.toISOString() ?? null,
    endDate: s.endDate?.toISOString() ?? null,
    approvedAt: s.approvedAt?.toISOString() ?? null,
    rejectedAt: s.rejectedAt?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  })));
}

// POST — seller subscribes to a plan
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { store: { select: { id: true } } },
  });
  if (!user || user.role !== "SELLER" || !user.store) {
    return NextResponse.json({ error: "Not a seller" }, { status: 403 });
  }

  const { planId } = await req.json();
  if (!planId) return NextResponse.json({ error: "planId required" }, { status: 400 });

  const plan = await prisma.adPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) {
    return NextResponse.json({ error: "Plan not found or inactive" }, { status: 404 });
  }

  // Check if seller already has an active or pending subscription
  const existing = await prisma.adSubscription.findFirst({
    where: {
      storeId: user.store.id,
      status: { in: ["PENDING", "ACTIVE"] },
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You already have an active or pending advertisement plan" },
      { status: 400 }
    );
  }

  const subscription = await prisma.adSubscription.create({
    data: {
      storeId: user.store.id,
      planId,
      status: "PENDING",
    },
    include: { plan: true },
  });

  return NextResponse.json(subscription, { status: 201 });
}

// DELETE — seller cancels their own subscription
export async function DELETE(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { store: { select: { id: true } } },
  });
  if (!user || !user.store) return NextResponse.json({ error: "Not a seller" }, { status: 403 });

  const { subscriptionId } = await req.json();
  if (!subscriptionId) return NextResponse.json({ error: "subscriptionId required" }, { status: 400 });

  const sub = await prisma.adSubscription.findUnique({ where: { id: subscriptionId } });
  if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  if (sub.storeId !== user.store.id) return NextResponse.json({ error: "Not your subscription" }, { status: 403 });
  if (sub.status !== "PENDING" && sub.status !== "ACTIVE") {
    return NextResponse.json({ error: "Can only cancel pending or active subscriptions" }, { status: 400 });
  }

  const updated = await prisma.adSubscription.update({
    where: { id: subscriptionId },
    data: { status: "CANCELLED" },
    include: { plan: true },
  });

  return NextResponse.json(updated);
}
