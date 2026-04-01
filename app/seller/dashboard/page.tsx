import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import UnderReviewBanner from "@/components/dashboard/shared/UnderReviewBanner";
import DashboardClient from "@/components/seller/dashboard/DashboardClient";
import { Plus, RefreshCw, WifiOff } from "lucide-react";

export default async function SellerDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        store: {
          include: {
            sellerProducts: { orderBy: { sortOrder: "asc" } },
            analytics: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("[seller/dashboard] DB error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Connection Error</h2>
          <p className="text-sm text-gray-500 mb-6">
            We couldn&apos;t load your dashboard right now. This is usually a temporary issue with the database connection.
          </p>
          <Link
            href="/seller/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E53935] text-white rounded-xl font-semibold text-sm hover:bg-[#C62828] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  if (!user) redirect("/auth?tab=login");
  if (user.role !== "SELLER") redirect("/");

  const store = user.store;
  const analytics = store?.analytics;
  const allProducts = store?.sellerProducts ?? [];
  const publishedProducts = allProducts.filter((p) => p.status === "PUBLISHED");
  const pendingProducts = allProducts.filter((p) => p.status === "DRAFT");

  // Today boundaries
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const storeId = store?.id;

  let orderCount = 0;
  let pendingOrderCount = 0;
  let revenueResult: { _sum: { sellerRevenue: number | null } } = { _sum: { sellerRevenue: null } };
  let profitResult: { _sum: { profit: number | null } } = { _sum: { profit: null } };
  let todayProfitResult: { _sum: { profit: number | null } } = { _sum: { profit: null } };
  let todayOrderCountResult = 0;
  let totalWithdrawnResult: { _sum: { amount: number | null } } = { _sum: { amount: null } };
  let pendingWithdrawalResult: { _sum: { amount: number | null } } = { _sum: { amount: null } };

  if (storeId) {
    try {
      [
        orderCount,
        pendingOrderCount,
        revenueResult,
        profitResult,
        todayProfitResult,
        todayOrderCountResult,
      ] = await Promise.all([
        prisma.order.count({ where: { storeId } }),
        prisma.order.count({ where: { storeId, status: { in: ["PENDING", "CONTACTED_ADMIN"] } } }),
        prisma.order.aggregate({
          where: { storeId, status: "COMPLETED" },
          _sum: { sellerRevenue: true },
        }),
        prisma.order.aggregate({
          where: { storeId, status: "COMPLETED" },
          _sum: { profit: true },
        }),
        prisma.order.aggregate({
          where: {
            storeId,
            status: "COMPLETED",
            completedAt: { gte: todayStart, lte: todayEnd },
          },
          _sum: { profit: true },
        }),
        prisma.order.count({
          where: {
            storeId,
            createdAt: { gte: todayStart, lte: todayEnd },
          },
        }),
      ]);

      [totalWithdrawnResult, pendingWithdrawalResult] = await Promise.all([
        prisma.withdrawal.aggregate({
          where: { storeId, status: "APPROVED" },
          _sum: { amount: true },
        }),
        prisma.withdrawal.aggregate({
          where: { storeId, status: "PENDING" },
          _sum: { amount: true },
        }),
      ]);
    } catch (error) {
      console.error("[seller/dashboard] Stats query error:", error);
    }
  }

  const revenueAdjustment = analytics?.revenueAdjustment ?? 0;
  const totalRevenue = (revenueResult._sum.sellerRevenue ?? 0) + revenueAdjustment;
  const totalProfit = (profitResult._sum.profit ?? 0) + revenueAdjustment;
  const todayProfit = todayProfitResult._sum.profit ?? 0;
  const totalWithdrawn = totalWithdrawnResult._sum.amount ?? 0;
  const pendingWithdrawals = pendingWithdrawalResult._sum.amount ?? 0;
  const availableBalance = totalRevenue - totalWithdrawn - pendingWithdrawals;

  const checklist = [
    { done: true, text: "Create your account" },
    { done: Boolean(store?.logoUrl), text: "Upload your store logo", link: "/seller/store" },
    { done: Boolean(store?.description), text: "Complete store description", link: "/seller/store" },
    { done: user.status === "ACTIVE", text: "Wait for account approval" },
    { done: publishedProducts.length > 0, text: "Add your first product", link: "/seller/products" },
    { done: orderCount > 0, text: "Make your first sale" },
  ];

  return (
    <DashboardLayout
      role="SELLER"
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        avatarUrl: user.avatarUrl,
        store: store
          ? { storeName: store.storeName, logoUrl: store.logoUrl }
          : null,
      }}
    >
      <UnderReviewBanner status={user.status} role="SELLER" />

      <div className="p-6 min-h-screen bg-[#F5F6FA]">
        {/* Welcome */}
        <div className="flex items-start justify-between flex-wrap gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-[#6B7280] mt-1 flex items-center gap-2 flex-wrap">
              {store?.storeName ?? "Your Store"}
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                  }`}
              >
                {user.status === "ACTIVE" ? "Active" : "Pending Approval"}
              </span>
            </p>
          </div>

          <Link
            href="/seller/products"
            className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-xl text-sm font-semibold hover:bg-[#C62828] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Manage Products
          </Link>
        </div>

        <DashboardClient
          data={{
            orderCount,
            pendingOrderCount,
            revenue: totalRevenue,
            profit: totalProfit,
            todayProfit,
            todayOrders: todayOrderCountResult,
            publishedCount: publishedProducts.length,
            pendingProductCount: pendingProducts.length,
            storeViews: analytics?.totalViews ?? 0,
            availableBalance,
            totalWithdrawn,
            pendingWithdrawals,
            checklist,
          }}
        />
      </div>
    </DashboardLayout>
  );
}
