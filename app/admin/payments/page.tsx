import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import AdminWithdrawalsClient from "@/components/payments/AdminWithdrawalsClient";

export default async function AdminPaymentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) redirect("/auth?tab=login");
  if (user.role !== "ADMIN") redirect("/");

  // Fetch all withdrawals with store/seller info
  const withdrawals = await prisma.withdrawal.findMany({
    include: {
      store: {
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true, avatarUrl: true },
          },
        },
      },
    },
    orderBy: { requestedAt: "desc" },
    take: 100,
  });

  // Summary stats
  const [pendingCount, approvedSum, rejectedCount, totalCount] = await Promise.all([
    prisma.withdrawal.count({ where: { status: "PENDING" } }),
    prisma.withdrawal.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true },
    }),
    prisma.withdrawal.count({ where: { status: "REJECTED" } }),
    prisma.withdrawal.count(),
  ]);

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
      <AdminWithdrawalsClient
        withdrawals={withdrawals.map((w) => ({
          id: w.id,
          amount: w.amount,
          status: w.status,
          method: w.method,
          bankName: w.bankName,
          accountNumber: w.accountNumber,
          accountHolderName: w.accountHolderName,
          walletAddress: w.walletAddress,
          sellerNote: w.sellerNote,
          adminNote: w.adminNote,
          requestedAt: w.requestedAt.toISOString(),
          reviewedAt: w.reviewedAt?.toISOString() ?? null,
          store: {
            id: w.store.id,
            storeName: w.store.storeName,
            seller: {
              firstName: w.store.user.firstName,
              lastName: w.store.user.lastName,
              email: w.store.user.email,
              avatarUrl: w.store.user.avatarUrl,
            },
          },
        }))}
        stats={{
          pendingCount,
          totalApproved: approvedSum._sum.amount ?? 0,
          rejectedCount,
          totalCount,
        }}
      />
    </DashboardLayout>
  );
}
