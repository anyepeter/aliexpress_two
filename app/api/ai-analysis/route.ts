import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET — check subscription status
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { store: { select: { id: true } } },
  });
  if (!user || !user.store) return NextResponse.json({ error: "Not a seller" }, { status: 403 });

  const subscription = await prisma.aiAnalysisSubscription.findFirst({
    where: { storeId: user.store.id, status: { in: ["ACTIVE", "PENDING"] } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    hasAccess: subscription?.status === "ACTIVE",
    subscription: subscription
      ? {
          ...subscription,
          startDate: subscription.startDate?.toISOString() ?? null,
          endDate: subscription.endDate?.toISOString() ?? null,
          approvedAt: subscription.approvedAt?.toISOString() ?? null,
          createdAt: subscription.createdAt.toISOString(),
        }
      : null,
  });
}

// POST — subscribe to AI Analysis
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

  const existing = await prisma.aiAnalysisSubscription.findFirst({
    where: { storeId: user.store.id, status: { in: ["ACTIVE", "PENDING"] } },
  });
  if (existing) {
    return NextResponse.json({ error: "You already have an active or pending subscription" }, { status: 400 });
  }

  const subscription = await prisma.aiAnalysisSubscription.create({
    data: { storeId: user.store.id, status: "PENDING", price: 299 },
  });

  return NextResponse.json(subscription, { status: 201 });
}
