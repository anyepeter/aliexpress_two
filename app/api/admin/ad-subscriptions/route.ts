import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET — admin: list all subscriptions
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const status = new URL(req.url).searchParams.get("status");
  const where = status && status !== "all" ? { status: status as "PENDING" | "ACTIVE" | "EXPIRED" } : {};

  const subscriptions = await prisma.adSubscription.findMany({
    where,
    include: {
      plan: true,
      store: {
        select: {
          id: true,
          storeName: true,
          storeSlug: true,
          logoUrl: true,
          isVerified: true,
          user: { select: { firstName: true, lastName: true, email: true } },
          analytics: { select: { totalViews: true } },
        },
      },
    },
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

// PATCH — admin: approve/reject subscription
export async function PATCH(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { subscriptionId, action, adminNote } = await req.json();
  if (!subscriptionId || !action) {
    return NextResponse.json({ error: "subscriptionId and action required" }, { status: 400 });
  }

  const sub = await prisma.adSubscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true },
  });
  if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

  if (action === "approve") {
    if (sub.status !== "PENDING") {
      return NextResponse.json({ error: "Can only approve pending subscriptions" }, { status: 400 });
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + sub.plan.durationDays * 24 * 60 * 60 * 1000);

    const updated = await prisma.adSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: "ACTIVE",
        startDate: now,
        endDate,
        approvedAt: now,
        adminNote: adminNote || null,
      },
      include: { plan: true },
    });

    return NextResponse.json(updated);
  }

  if (action === "reject") {
    const updated = await prisma.adSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        adminNote: adminNote || null,
      },
      include: { plan: true },
    });
    return NextResponse.json(updated);
  }

  if (action === "cancel") {
    if (sub.status !== "PENDING" && sub.status !== "ACTIVE") {
      return NextResponse.json({ error: "Can only cancel pending or active subscriptions" }, { status: 400 });
    }
    const updated = await prisma.adSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: "CANCELLED",
        adminNote: adminNote || null,
      },
      include: { plan: true },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
