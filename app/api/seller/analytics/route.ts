import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 300; // 5 minutes

function getPeriodDate(period: string): Date | null {
  const now = new Date();
  switch (period) {
    case "7d": return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d": return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d": return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default: return null; // "all"
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { store: { select: { id: true } } },
    });

    if (!user || user.role !== "SELLER" || !user.store) {
      return NextResponse.json({ error: "Not a seller" }, { status: 403 });
    }

    const storeId = user.store.id;
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30d";
    const periodDate = getPeriodDate(period);

    const dateFilter = periodDate ? { gte: periodDate } : undefined;

    // Fetch all data in parallel
    const [
      orders,
      products,
      activeLoan,
      orderAnalytics,
    ] = await Promise.all([
      prisma.order.findMany({
        where: {
          storeId,
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.sellerProduct.findMany({
        where: { storeId, status: "PUBLISHED" },
      }),
      prisma.loanRequest.findFirst({
        where: { storeId, status: { in: ["PENDING", "APPROVED"] } },
      }),
      prisma.orderAnalytics.findMany({
        where: {
          storeId,
          ...(dateFilter ? { completedAt: dateFilter } : {}),
        },
        orderBy: { completedAt: "desc" },
      }),
    ]);

    const completedOrders = orders.filter((o) => o.status === "COMPLETED");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalProfit = completedOrders.reduce((sum, o) => sum + o.profit, 0);
    const totalOrders = completedOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const summary = {
      totalRevenue,
      totalProfit,
      totalOrders,
      totalProducts: products.length,
      avgOrderValue,
      profitMargin,
      loanBalance: activeLoan?.balanceRemaining ?? 0,
      loanTotalAmount: activeLoan?.approvedAmount ?? activeLoan?.amount ?? 0,
      loanStatus: activeLoan?.status ?? null,
    };

    // Revenue by day
    const revenueByDayMap = new Map<string, { revenue: number; profit: number; orders: number }>();
    completedOrders.forEach((o) => {
      const dateKey = new Date(o.completedAt ?? o.createdAt).toISOString().split("T")[0];
      const existing = revenueByDayMap.get(dateKey) || { revenue: 0, profit: 0, orders: 0 };
      existing.revenue += o.totalAmount;
      existing.profit += o.profit;
      existing.orders += 1;
      revenueByDayMap.set(dateKey, existing);
    });

    // Fill in missing days
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
    const revenueByDay = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const data = revenueByDayMap.get(key) || { revenue: 0, profit: 0, orders: 0 };
      revenueByDay.push({ date: key, ...data });
    }

    // Top products
    const productMap = new Map<string, { title: string; category: string; thumbnail: string; orders: number; revenue: number; profit: number }>();
    completedOrders.forEach((o) => {
      o.items.forEach((item) => {
        const key = item.productId;
        const existing = productMap.get(key) || {
          title: item.title,
          category: item.title.split(" ")[0],
          thumbnail: item.thumbnail,
          orders: 0,
          revenue: 0,
          profit: 0,
        };
        existing.orders += item.quantity;
        existing.revenue += item.total;
        existing.profit += (item.price - item.basePrice) * item.quantity;
        productMap.set(key, existing);
      });
    });
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    // Orders by status
    const statusCounts = new Map<string, number>();
    orders.forEach((o) => {
      statusCounts.set(o.status, (statusCounts.get(o.status) || 0) + 1);
    });
    const STATUS_COLORS: Record<string, string> = {
      PENDING: "#F59E0B",
      CONTACTED_ADMIN: "#8B5CF6",
      SHIPPING: "#06B6D4",
      COMPLETED: "#16A34A",
      REJECTED: "#DC2626",
    };
    const ordersByStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
      color: STATUS_COLORS[status] || "#6B7280",
    }));

    // Category breakdown
    const categoryMap = new Map<string, { orders: number; revenue: number }>();
    completedOrders.forEach((o) => {
      o.items.forEach((item) => {
        const cat = item.title.split(" ")[0] || "Other";
        const existing = categoryMap.get(cat) || { orders: 0, revenue: 0 };
        existing.orders += item.quantity;
        existing.revenue += item.total;
        categoryMap.set(cat, existing);
      });
    });
    const totalCategoryRevenue = Array.from(categoryMap.values()).reduce((s, c) => s + c.revenue, 0);
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        orders: data.orders,
        revenue: data.revenue,
        percentage: totalCategoryRevenue > 0 ? (data.revenue / totalCategoryRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    // Recent orders
    const recentOrders = orders.slice(0, 20).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      productTitle: o.items[0]?.title ?? "Order",
      thumbnail: o.items[0]?.thumbnail ?? "",
      sellingPrice: o.totalAmount,
      basePrice: o.baseCost,
      profit: o.profit,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    }));

    // Monthly trend (last 6 months)
    const monthlyMap = new Map<string, { revenue: number; profit: number; orders: number }>();
    completedOrders.forEach((o) => {
      const d = new Date(o.completedAt ?? o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyMap.get(key) || { revenue: 0, profit: 0, orders: 0 };
      existing.revenue += o.totalAmount;
      existing.profit += o.profit;
      existing.orders += 1;
      monthlyMap.set(key, existing);
    });
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const data = monthlyMap.get(key) || { revenue: 0, profit: 0, orders: 0 };
      monthlyTrend.push({ month: monthNames[d.getMonth()], ...data });
    }

    return NextResponse.json({
      summary,
      revenueByDay,
      topProducts,
      ordersByStatus,
      categoryBreakdown,
      recentOrders,
      monthlyTrend,
    });
  } catch (error) {
    console.error("GET /api/seller/analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
