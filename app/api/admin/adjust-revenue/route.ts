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

  // Get current analytics
  const analytics = await prisma.storeAnalytics.findUnique({
    where: { storeId },
  });

  if (!analytics) {
    // Create analytics if it doesn't exist
    await prisma.storeAnalytics.create({
      data: {
        storeId,
        totalRevenue: Math.max(0, amount),
        totalProfit: Math.max(0, amount),
        totalOrders: 0,
        totalViews: 0,
      },
    });
  } else {
    const newRevenue = Math.max(0, analytics.totalRevenue + amount);
    const newProfit = Math.max(0, analytics.totalProfit + amount);

    await prisma.storeAnalytics.update({
      where: { storeId },
      data: {
        totalRevenue: newRevenue,
        totalProfit: newProfit,
      },
    });
  }

  // Fetch updated analytics
  const updated = await prisma.storeAnalytics.findUnique({
    where: { storeId },
  });

  return NextResponse.json({
    success: true,
    totalRevenue: updated?.totalRevenue ?? 0,
    totalProfit: updated?.totalProfit ?? 0,
  });
}
