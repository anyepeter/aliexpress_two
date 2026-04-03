import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CRON_SECRET = process.env.CRON_SECRET ?? "cron-secret-key";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const querySecret = new URL(req.url).searchParams.get("secret");

  if (authHeader !== `Bearer ${CRON_SECRET}` && querySecret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let boosted = 0;
  let expired = 0;

  try {
    // 1. Expire subscriptions past their end date
    const expiredSubs = await prisma.adSubscription.updateMany({
      where: {
        status: "ACTIVE",
        endDate: { lt: now },
      },
      data: { status: "EXPIRED" },
    });
    expired = expiredSubs.count;

    // 2. Boost visitors for active subscriptions
    const activeSubs = await prisma.adSubscription.findMany({
      where: { status: "ACTIVE" },
      include: {
        plan: { select: { minVisitorsDay: true, maxVisitorsDay: true } },
        store: { select: { id: true } },
      },
    });

    for (const sub of activeSubs) {
      const { minVisitorsDay, maxVisitorsDay } = sub.plan;
      const visitors = Math.floor(
        Math.random() * (maxVisitorsDay - minVisitorsDay + 1) + minVisitorsDay
      );

      // Upsert store analytics — add visitors
      await prisma.storeAnalytics.upsert({
        where: { storeId: sub.storeId },
        create: {
          storeId: sub.storeId,
          totalViews: visitors,
          totalOrders: 0,
          totalRevenue: 0,
          totalProfit: 0,
        },
        update: {
          totalViews: { increment: visitors },
        },
      });

      boosted++;
    }

    return NextResponse.json({
      success: true,
      expired,
      boosted,
      totalActive: activeSubs.length,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Ad visitors cron error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
