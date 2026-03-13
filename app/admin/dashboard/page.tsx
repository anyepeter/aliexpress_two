import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import { Card } from "@/components/ui/card";
import AdminPendingSellers from "@/components/dashboard/admin/AdminPendingSellers";
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  Clock,
  UserCheck,
  MessageSquare,
  ArrowRight,
  Wallet,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) redirect("/auth?tab=login");
  if (user.role !== "ADMIN") redirect("/");

  // Fetch stats in parallel
  const [
    totalUsers,
    totalSellers,
    totalBuyers,
    pendingCount,
    totalOrders,
    pendingOrderCount,
    revenueResult,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.user.count({ where: { role: "SELLER", status: "PENDING_APPROVAL" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["PENDING", "CONTACTED_ADMIN"] } } }),
    prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { totalAmount: true },
    }),
  ]);

  const totalRevenue = revenueResult._sum.totalAmount ?? 0;

  // Recent unread conversations
  const recentConversations = await prisma.conversation.findMany({
    where: {
      OR: [{ adminId: user.id }],
      messages: { some: { senderId: { not: user.id }, status: { not: "READ" } } },
    },
    include: {
      buyer: { select: { firstName: true, lastName: true, avatarUrl: true } },
      seller: { select: { firstName: true, lastName: true, avatarUrl: true, store: { select: { storeName: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { content: true, createdAt: true } },
    },
    orderBy: { lastMessageAt: "desc" },
    take: 5,
  });

  // Pending withdrawals
  const [pendingWithdrawalsCount, pendingWithdrawals] = await Promise.all([
    prisma.withdrawal.count({ where: { status: "PENDING" } }),
    prisma.withdrawal.findMany({
      where: { status: "PENDING" },
      include: {
        store: {
          include: {
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { requestedAt: "asc" },
      take: 5,
    }),
  ]);

  // Pending sellers for table
  const pendingSellers = await prisma.user.findMany({
    where: { role: "SELLER", status: "PENDING_APPROVAL" },
    include: { store: { select: { storeName: true, createdAt: true } } },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const STATS = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "blue" as const },
    { label: "Sellers", value: totalSellers, icon: Store, color: "amber" as const },
    { label: "Buyers", value: totalBuyers, icon: ShoppingBag, color: "green" as const },
    { label: "Pending Approval", value: pendingCount, icon: Clock, color: "rose" as const },
    { label: "Total Orders", value: `${totalOrders}${pendingOrderCount > 0 ? ` (${pendingOrderCount} pending)` : ""}`, icon: ShoppingBag, color: "purple" as const },
    { label: "Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "emerald" as const },
    { label: "Pending Withdrawals", value: pendingWithdrawalsCount, icon: Wallet, color: "amber" as const },
  ];

  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    green: { bg: "bg-green-50", text: "text-green-600" },
    rose: { bg: "bg-rose-50", text: "text-rose-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
  } as const;

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
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel — MarketHub</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user.firstName}. Here&apos;s what&apos;s happening.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{label}</span>
                <div className={`p-2 rounded-lg ${colorMap[color].bg}`}>
                  <Icon className={`w-4 h-4 ${colorMap[color].text}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: "Manage Sellers", href: "/admin/sellers", icon: Users, gradient: "from-blue-500 to-blue-600" },
            { label: "All Orders", href: "/admin/orders", icon: ShoppingBag, gradient: "from-purple-500 to-purple-600" },
            { label: "Withdrawals", href: "/admin/payments", icon: Wallet, gradient: "from-teal-500 to-teal-600" },
            { label: "Loan Requests", href: "/admin/loans", icon: DollarSign, gradient: "from-amber-500 to-amber-600" },
            { label: "Messages", href: "/messages", icon: MessageSquare, gradient: "from-indigo-500 to-indigo-600" },
            { label: "Visitors", href: "/admin/visitors", icon: UserCheck, gradient: "from-emerald-500 to-emerald-600" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-transparent hover:border-gray-100"
            >
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Recent Messages */}
        {recentConversations.length > 0 && (
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#E53935]" />
                Unread Messages
              </h2>
              <Link
                href="/messages"
                className="text-xs text-[#E53935] font-medium hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentConversations.map((conv) => {
                const other = conv.type === "SELLER_ADMIN" ? conv.seller : conv.buyer;
                const lastMsg = conv.messages[0];
                return (
                  <Link
                    key={conv.id}
                    href={`/messages?c=${conv.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    {other?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={other.avatarUrl}
                        alt={`${other.firstName} ${other.lastName}`}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#E53935] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">
                          {other?.firstName?.[0]?.toUpperCase() ?? "?"}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {other ? `${other.firstName} ${other.lastName}` : "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {lastMsg?.content ?? conv.subject ?? "New conversation"}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E53935] block" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        )}

        {/* Pending Withdrawals */}
        {pendingWithdrawals.length > 0 && (
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#E53935]" />
                Pending Withdrawals
              </h2>
              <Link
                href="/admin/payments"
                className="text-xs text-[#E53935] font-medium hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingWithdrawals.map((w) => (
                <Link
                  key={w.id}
                  href="/admin/payments"
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  {w.store.user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={w.store.user.avatarUrl}
                      alt={`${w.store.user.firstName} ${w.store.user.lastName}`}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#E53935] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">
                        {w.store.user.firstName[0]?.toUpperCase() ?? "?"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {w.store.user.firstName} {w.store.user.lastName}
                      <span className="text-gray-400 font-normal"> &bull; {w.store.storeName}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Requested ${w.amount.toFixed(2)} &bull;{" "}
                      {w.requestedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                    Pending
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {/* Pending sellers */}
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <UserCheck className="w-5 h-5 text-[#E53935]" />
            <h2 className="font-semibold text-gray-900">Pending Seller Applications</h2>
            {pendingCount > 0 && (
              <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </div>
          <AdminPendingSellers sellers={pendingSellers} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
