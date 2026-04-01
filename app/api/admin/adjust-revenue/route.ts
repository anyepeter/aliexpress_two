import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!admin || admin.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { storeId, amount } = body as {
    storeId: string;
    amount: number;
  };

  if (!storeId || typeof amount !== "number" || amount === 0) {
    return NextResponse.json({ error: "storeId and non-zero amount required" }, { status: 400 });
  }

  // Upsert analytics and adjust the revenueAdjustment field
  const analytics = await prisma.storeAnalytics.findUnique({ where: { storeId } });

  if (!analytics) {
    await prisma.storeAnalytics.create({
      data: {
        storeId,
        revenueAdjustment: amount,
        totalRevenue: 0,
        totalProfit: 0,
        totalOrders: 0,
        totalViews: 0,
      },
    });
  } else {
    await prisma.storeAnalytics.update({
      where: { storeId },
      data: {
        revenueAdjustment: analytics.revenueAdjustment + amount,
      },
    });
  }

  const updated = await prisma.storeAnalytics.findUnique({ where: { storeId } });

  return NextResponse.json({
    success: true,
    revenueAdjustment: updated?.revenueAdjustment ?? 0,
  });
}
