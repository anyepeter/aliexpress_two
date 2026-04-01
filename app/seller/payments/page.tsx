import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import SellerPaymentsClient from "@/components/payments/SellerPaymentsClient";

export default async function SellerPaymentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      store: {
        select: {
          id: true,
          storeName: true,
          logoUrl: true,
        },
      },
    },
  });

  if (!user) redirect("/auth?tab=login");
  if (user.role !== "SELLER") redirect("/");
  if (!user.store) redirect("/seller/dashboard");

  // Compute balance
  const [revenueResult, totalWithdrawnResult, pendingResult, analyticsResult] = await Promise.all([
    prisma.order.aggregate({
      where: { storeId: user.store.id, status: "COMPLETED" },
      _sum: { sellerRevenue: true },
    }),
    prisma.withdrawal.aggregate({
      where: { storeId: user.store.id, status: "APPROVED" },
      _sum: { amount: true },
    }),
    prisma.withdrawal.aggregate({
      where: { storeId: user.store.id, status: "PENDING" },
      _sum: { amount: true },
    }),
    prisma.storeAnalytics.findUnique({
      where: { storeId: user.store.id },
      select: { revenueAdjustment: true },
    }),
  ]);

  const revenueAdjustment = analyticsResult?.revenueAdjustment ?? 0;
  const totalEarnings = (revenueResult._sum.sellerRevenue ?? 0) + revenueAdjustment;
  const withdrawn = totalWithdrawnResult._sum.amount ?? 0;
  const pendingAmount = pendingResult._sum.amount ?? 0;
  const availableBalance = totalEarnings - withdrawn - pendingAmount;

  // Recent withdrawals
  const withdrawals = await prisma.withdrawal.findMany({
    where: { storeId: user.store.id },
    orderBy: { requestedAt: "desc" },
    take: 50,
  });

  // Recent approved orders (earnings history)
  const recentOrders = await prisma.order.findMany({
    where: { storeId: user.store.id, status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    take: 10,
    select: {
      id: true,
      orderNumber: true,
      profit: true,
      sellerRevenue: true,
      totalAmount: true,
      completedAt: true,
    },
  });

  return (
    <DashboardLayout
      role="SELLER"
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        avatarUrl: user.avatarUrl,
        store: user.store
          ? { storeName: user.store.storeName, logoUrl: user.store.logoUrl }
          : null,
      }}
    >
      <SellerPaymentsClient
        balance={{
          totalEarnings,
          withdrawn,
          pendingAmount,
          availableBalance,
        }}
        withdrawals={withdrawals.map((w) => ({
          ...w,
          requestedAt: w.requestedAt.toISOString(),
          reviewedAt: w.reviewedAt?.toISOString() ?? null,
          createdAt: w.createdAt.toISOString(),
          updatedAt: w.updatedAt.toISOString(),
        }))}
        recentOrders={recentOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          profit: o.profit,
          sellerRevenue: o.sellerRevenue,
          totalAmount: o.totalAmount,
          completedAt: o.completedAt?.toISOString() ?? null,
        }))}
        isActive={user.status === "ACTIVE"}
      />
    </DashboardLayout>
  );
}
