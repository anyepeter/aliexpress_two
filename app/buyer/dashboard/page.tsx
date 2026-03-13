import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import UnderReviewBanner from "@/components/dashboard/shared/UnderReviewBanner";
import { Card } from "@/components/ui/card";
import {
  ShoppingBag,
  Heart,
  MessageSquare,
  DollarSign,
  Store,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function BuyerDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) redirect("/auth?tab=login");
  if (user.role !== "BUYER") redirect("/");

  // Fetch real order stats
  const [orderCount, totalSpentResult, pendingCount, approvedCount, recentOrders] =
    await Promise.all([
      prisma.order.count({ where: { buyerId: user.id } }),
      prisma.order.aggregate({
        where: { buyerId: user.id },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({ where: { buyerId: user.id, status: "PENDING" } }),
      prisma.order.count({ where: { buyerId: user.id, status: "COMPLETED" } }),
      prisma.order.findMany({
        where: { buyerId: user.id },
        include: {
          store: { select: { storeName: true, logoUrl: true, isVerified: true } },
          items: { take: 1, select: { thumbnail: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const totalSpent = totalSpentResult._sum.totalAmount ?? 0;

  const STATS = [
    { label: "My Orders", value: String(orderCount), icon: ShoppingBag, color: "blue" as const },
    { label: "Pending", value: String(pendingCount), icon: Clock, color: "rose" as const },
    { label: "Completed", value: String(approvedCount), icon: CheckCircle2, color: "amber" as const },
    { label: "Total Spent", value: `$${totalSpent.toFixed(2)}`, icon: DollarSign, color: "green" as const },
  ];

  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    rose: { bg: "bg-rose-50", text: "text-rose-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    green: { bg: "bg-green-50", text: "text-green-600" },
  } as const;

  return (
    <DashboardLayout
      role="BUYER"
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        avatarUrl: user.avatarUrl,
      }}
    >
      <UnderReviewBanner status={user.status} role="BUYER" />

      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user.firstName}!
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s your shopping overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Recent orders or empty state */}
        {recentOrders.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#E53935]" />
                Recent Orders
              </h2>
              <Link
                href="/buyer/orders"
                className="text-xs text-[#E53935] font-medium hover:underline"
              >
                View all ({orderCount})
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href="/buyer/orders"
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  {order.store?.logoUrl ? (
                    <Image
                      src={order.store.logoUrl}
                      alt={order.store.storeName}
                      width={36}
                      height={36}
                      className="rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#E53935] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">
                        {(order.store?.storeName ?? "M")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.store?.storeName ?? "MarketHub"} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#1A1A1A]">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === "COMPLETED"
                          ? "bg-green-50 text-green-700"
                          : order.status === "REJECTED"
                          ? "bg-red-50 text-red-700"
                          : order.status === "SHIPPING"
                          ? "bg-indigo-50 text-indigo-700"
                          : order.status === "CONTACTED_ADMIN"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {order.status === "CONTACTED_ADMIN"
                        ? "Processing"
                        : order.status === "SHIPPING"
                        ? "Shipping"
                        : order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-10 flex flex-col items-center text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-700 mb-1">No orders yet</h3>
            <p className="text-sm text-gray-400 mb-5">
              You haven&apos;t placed any orders yet. Start exploring our marketplace!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E53935] text-white text-sm font-semibold rounded-lg hover:bg-[#C62828] transition-colors"
            >
              Start Shopping
            </Link>
          </Card>
        )}

        {/* Need Help? */}
        <Card className="p-6 border-[#E53935]/20 bg-gradient-to-r from-[#E53935]/5 to-[#E53935]/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 bg-[#E53935]/10 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-[#E53935]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Need help?</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Have a question about an order or need assistance? Our admin team is here to help.
              </p>
            </div>
            <Link
              href="/messages"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E53935] text-white text-sm font-semibold rounded-lg hover:bg-[#C62828] transition-colors shrink-0"
            >
              Messages
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>

        {/* Become a Seller CTA */}
        <Card className="p-6 border-[#E53935]/30 bg-gradient-to-r from-[#E53935]/5 to-[#E53935]/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 bg-[#E53935]/10 rounded-xl flex items-center justify-center shrink-0">
              <Store className="w-6 h-6 text-[#E53935]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Want to start selling?</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Upgrade your account to become a seller and reach millions of buyers worldwide.
              </p>
            </div>
            <Link
              href="/seller/become-seller"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E53935] text-white text-sm font-semibold rounded-lg hover:bg-[#C62828] transition-colors shrink-0"
            >
              Become a Seller
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
