import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import AdminAnalyticsClient from "@/components/dashboard/admin/AdminAnalyticsClient";

export default async function AdminAnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) redirect("/auth?tab=login");
  if (user.role !== "ADMIN") redirect("/");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const previousThirtyDays = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    // User stats
    totalUsers,
    totalSellers,
    totalBuyers,
    newUsersThisMonth,
    newUsersPrevMonth,
    activeUsers,
    suspendedUsers,

    // Order stats
    totalOrders,
    ordersThisMonth,
    ordersPrevMonth,
    pendingOrders,
    completedOrders,
    rejectedOrders,
    shippingOrders,

    // Revenue
    totalRevenueResult,
    monthlyRevenueResult,
    prevMonthRevenueResult,
    weeklyRevenueResult,

    // Orders by day (last 30 days)
    recentOrders,

    // Top sellers
    topStores,

    // User growth (last 30 days)
    recentUsers,

    // Pending actions
    pendingApprovals,
    pendingWithdrawals,
    pendingLoans,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: previousThirtyDays, lt: thirtyDaysAgo } } }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),

    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.count({ where: { createdAt: { gte: previousThirtyDays, lt: thirtyDaysAgo } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.count({ where: { status: "REJECTED" } }),
    prisma.order.count({ where: { status: "SHIPPING" } }),

    prisma.order.aggregate({ where: { status: "COMPLETED" }, _sum: { totalAmount: true } }),
    prisma.order.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: thirtyDaysAgo } },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: previousThirtyDays, lt: thirtyDaysAgo } },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: sevenDaysAgo } },
      _sum: { totalAmount: true },
    }),

    // Recent orders for chart
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, totalAmount: true, status: true },
      orderBy: { createdAt: "asc" },
    }),

    // Top stores by revenue
    prisma.store.findMany({
      where: { user: { status: "ACTIVE" } },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
        analytics: { select: { totalRevenue: true, totalOrders: true, totalViews: true } },
        _count: { select: { sellerProducts: { where: { status: "PUBLISHED" } } } },
      },
      orderBy: { analytics: { totalRevenue: "desc" } },
      take: 10,
    }),

    // Recent users for growth chart
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, role: true },
      orderBy: { createdAt: "asc" },
    }),

    prisma.user.count({ where: { role: "SELLER", status: "PENDING_APPROVAL" } }),
    prisma.withdrawal.count({ where: { status: "PENDING" } }),
    prisma.loanRequest.count({ where: { status: "PENDING" } }),
  ]);

  // Aggregate orders by day
  const ordersByDay: Record<string, { count: number; revenue: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    ordersByDay[key] = { count: 0, revenue: 0 };
  }
  for (const o of recentOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (ordersByDay[key]) {
      ordersByDay[key].count++;
      if (o.status === "COMPLETED") {
        ordersByDay[key].revenue += o.totalAmount;
      }
    }
  }

  // Aggregate users by day
  const usersByDay: Record<string, { buyers: number; sellers: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    usersByDay[key] = { buyers: 0, sellers: 0 };
  }
  for (const u of recentUsers) {
    const key = u.createdAt.toISOString().slice(0, 10);
    if (usersByDay[key]) {
      if (u.role === "BUYER") usersByDay[key].buyers++;
      else if (u.role === "SELLER") usersByDay[key].sellers++;
    }
  }

  const analyticsData = {
    users: {
      total: totalUsers,
      sellers: totalSellers,
      buyers: totalBuyers,
      newThisMonth: newUsersThisMonth,
      newPrevMonth: newUsersPrevMonth,
      active: activeUsers,
      suspended: suspendedUsers,
    },
    orders: {
      total: totalOrders,
      thisMonth: ordersThisMonth,
      prevMonth: ordersPrevMonth,
      pending: pendingOrders,
      completed: completedOrders,
      rejected: rejectedOrders,
      shipping: shippingOrders,
    },
    revenue: {
      total: totalRevenueResult._sum.totalAmount ?? 0,
      thisMonth: monthlyRevenueResult._sum.totalAmount ?? 0,
      prevMonth: prevMonthRevenueResult._sum.totalAmount ?? 0,
      thisWeek: weeklyRevenueResult._sum.totalAmount ?? 0,
    },
    charts: {
      ordersByDay: Object.entries(ordersByDay).map(([date, data]) => ({
        date,
        ...data,
      })),
      usersByDay: Object.entries(usersByDay).map(([date, data]) => ({
        date,
        ...data,
      })),
    },
    topStores: topStores.map((s) => ({
      id: s.id,
      storeName: s.storeName,
      ownerName: `${s.user.firstName} ${s.user.lastName}`,
      ownerAvatar: s.user.avatarUrl,
      revenue: s.analytics?.totalRevenue ?? 0,
      orders: s.analytics?.totalOrders ?? 0,
      views: s.analytics?.totalViews ?? 0,
      products: s._count.sellerProducts,
      isPremium: s.isPremium,
    })),
    pending: {
      approvals: pendingApprovals,
      withdrawals: pendingWithdrawals,
      loans: pendingLoans,
    },
  };

  return (
    <DashboardLayout
      role="ADMIN"
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        avatarUrl: user.avatarUrl,
      }}
    >
      <AdminAnalyticsClient data={analyticsData} />
    </DashboardLayout>
  );
}
