import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET — list all AI analysis subscriptions
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const status = new URL(req.url).searchParams.get("status");
  const where = status && status !== "all" ? { status } : {};

  const subscriptions = await prisma.aiAnalysisSubscription.findMany({
    where,
    include: {
      store: {
        select: {
          id: true,
          storeName: true,
          storeSlug: true,
          logoUrl: true,
          isVerified: true,
          user: { select: { firstName: true, lastName: true, email: true } },
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
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  })));
}

// PATCH — approve/reject AI analysis subscription
export async function PATCH(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { subscriptionId, action } = await req.json();
  if (!subscriptionId || !action) {
    return NextResponse.json({ error: "subscriptionId and action required" }, { status: 400 });
  }

  const sub = await prisma.aiAnalysisSubscription.findUnique({ where: { id: subscriptionId } });
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "approve") {
    if (sub.status !== "PENDING") {
      return NextResponse.json({ error: "Can only approve pending subscriptions" }, { status: 400 });
    }
    const now = new Date();
    const updated = await prisma.aiAnalysisSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: "ACTIVE",
        startDate: now,
        endDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year
        approvedAt: now,
      },
    });
    return NextResponse.json(updated);
  }

  if (action === "reject") {
    const updated = await prisma.aiAnalysisSubscription.update({
      where: { id: subscriptionId },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json(updated);
  }

  if (action === "revoke") {
    const updated = await prisma.aiAnalysisSubscription.update({
      where: { id: subscriptionId },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
