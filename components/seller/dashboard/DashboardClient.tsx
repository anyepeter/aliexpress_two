"use client";

import { useState } from "react";
import Link from "next/link";
import { useSellerAnalytics } from "@/lib/hooks/useSellerAnalytics";
import { useLoanNotifications } from "@/lib/hooks/useLoanNotifications";
import type { AnalyticsPeriod } from "@/lib/types/analytics";
import PeriodSelector from "@/components/seller/analytics/PeriodSelector";
import RevenueChart from "@/components/seller/analytics/RevenueChart";
import TopProductsChart from "@/components/seller/analytics/TopProductsChart";
import OrderStatusChart from "@/components/seller/analytics/OrderStatusChart";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import {
    ShoppingBag,
    DollarSign,
    TrendingUp,
    Package,
    Eye,
    CreditCard,
    Clock,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Check,
    ArrowRight,
    Loader2,
    Wallet,
    Sunrise,
} from "lucide-react";

interface DashboardData {
    orderCount: number;
    pendingOrderCount: number;
    revenue: number;
    profit: number;
    todayProfit: number;
    todayOrders: number;
    publishedCount: number;
    pendingProductCount: number;
    storeViews: number;
    availableBalance: number;
    totalWithdrawn: number;
    pendingWithdrawals: number;
    checklist: { done: boolean; text: string; link?: string }[];
}

interface Props {
    data: DashboardData;
}

export default function DashboardClient({ data }: Props) {
    const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
    const { data: analytics, isLoading } = useSellerAnalytics(period);
    const [checklistOpen, setChecklistOpen] = useState(true);
    const [showAllCards, setShowAllCards] = useState(false);

    useLoanNotifications();

    const loanBalance = analytics?.summary?.loanBalance ?? 0;
    const loanTotalAmount = analytics?.summary?.loanTotalAmount ?? 0;
    const loanStatus = analytics?.summary?.loanStatus;

    const stats = [
        {
            label: "Total Orders",
            value: formatNumber(data.orderCount),
            sub: data.pendingOrderCount > 0 ? `+${data.pendingOrderCount} pending` : "All time",
            icon: ShoppingBag,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            href: "/seller/orders",
        },
        {
            label: "Total Revenue",
            value: formatCurrency(data.revenue),
            sub: "From completed orders",
            icon: DollarSign,
            iconBg: "bg-green-50",
            iconColor: "text-green-600",
        },
        {
            label: "Today's Profit",
            value: formatCurrency(data.todayProfit),
            sub: data.todayOrders > 0
                ? `${data.todayOrders} order${data.todayOrders > 1 ? "s" : ""} today`
                : "No orders today",
            icon: Sunrise,
            iconBg: data.todayProfit > 0 ? "bg-emerald-50" : "bg-gray-50",
            iconColor: data.todayProfit > 0 ? "text-emerald-600" : "text-gray-400",
            borderColor: data.todayProfit > 0 ? "border-l-4 border-l-emerald-400" : "",
            highlight: true,
        },
        {
            label: "Products",
            value: `${data.publishedCount} published`,
            sub: data.pendingProductCount > 0 ? `${data.pendingProductCount} pending` : "In your store",
            icon: Package,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600",
            href: "/seller/products",
        },
        {
            label: "Store Views",
            value: formatNumber(data.storeViews),
            sub: "All time",
            icon: Eye,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            label: "Available Balance",
            value: formatCurrency(data.availableBalance),
            sub: data.totalWithdrawn > 0 ? `${formatCurrency(data.totalWithdrawn)} withdrawn` : "From revenue",
            icon: Wallet,
            iconBg: data.availableBalance > 0 ? "bg-teal-50" : "bg-gray-50",
            iconColor: data.availableBalance > 0 ? "text-teal-600" : "text-gray-400",
            href: "/seller/payments",
            borderColor: data.availableBalance > 0 ? "border-l-4 border-l-teal-400" : "",
        },
        // {
        //     label: "Loan Balance",
        //     value: formatCurrency(loanBalance),
        //     sub: loanStatus === "APPROVED" ? `Total: ${formatCurrency(loanTotalAmount)}` : loanStatus === "PENDING" ? "Pending review" : "No active loan",
        //     icon: CreditCard,
        //     iconBg: loanBalance > 0 ? "bg-green-50" : loanStatus === "PENDING" ? "bg-amber-50" : "bg-gray-50",
        //     iconColor: loanBalance > 0 ? "text-green-600" : loanStatus === "PENDING" ? "text-amber-600" : "text-gray-500",
        //     href: "/seller/loans",
        //     borderColor: loanBalance > 0 ? "border-l-4 border-l-green-400" : loanStatus === "PENDING" ? "border-l-4 border-l-amber-400" : "",
        // },
        {
            label: "Pending Orders",
            value: formatNumber(data.pendingOrderCount),
            sub: data.pendingOrderCount > 0 ? "Needs funding" : "None pending",
            icon: Clock,
            iconBg: data.pendingOrderCount > 0 ? "bg-red-50" : "bg-gray-50",
            iconColor: data.pendingOrderCount > 0 ? "text-red-600" : "text-gray-500",
            href: "/seller/orders",
            borderColor: data.pendingOrderCount > 0 ? "border-l-4 border-l-red-400" : "",
        },
    ];

    const completedChecklist = data.checklist.filter((c) => c.done).length;
    const allDone = completedChecklist === data.checklist.length;

    // Mobile: first 4 cards, rest hidden behind toggle
    const MOBILE_VISIBLE = 4;
    const mobileVisibleStats = showAllCards ? stats : stats.slice(0, MOBILE_VISIBLE);
    const hasMoreCards = stats.length > MOBILE_VISIBLE;

    const renderStatCard = (stat: (typeof stats)[0], i: number) => {
        const content = (
            <div
                className={`bg-white rounded-2xl p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 cursor-pointer ${stat.borderColor ?? ""} ${"highlight" in stat && stat.highlight && data.todayProfit > 0
                    ? "ring-2 ring-emerald-200 ring-offset-1"
                    : ""
                    }`}
                style={{
                    animation: "fadeInUp 0.5s ease-out both",
                    animationDelay: `${i * 70}ms`,
                }}
            >
                <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${stat.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                        <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                    </div>
                    {"highlight" in stat && stat.highlight && data.todayProfit > 0 && (
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                    )}
                </div>
                <p className="text-2xl font-bold text-[#E53935] transition-all duration-300">{stat.value}</p>
                <p className="text-xs text-[#6B7280] mt-1 font-medium">{stat.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{stat.sub}</p>
            </div>
        );
        return stat.href ? (
            <Link key={stat.label} href={stat.href} className="group">{content}</Link>
        ) : (
            <div key={stat.label} className="group">{content}</div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                    { label: "Add Product", href: "/seller/products", icon: Package, gradient: "from-blue-500 to-blue-600" },
                    { label: "View Orders", href: "/seller/orders", icon: ShoppingBag, gradient: "from-purple-500 to-purple-600" },
                    { label: "Withdraw", href: "/seller/payments", icon: Wallet, gradient: "from-teal-500 to-teal-600" },
                    { label: "Take a Loan", href: "/seller/loans", icon: CreditCard, gradient: "from-amber-500 to-amber-600" },
                    { label: "Analytics", href: "/seller/analytics", icon: TrendingUp, gradient: "from-emerald-500 to-emerald-600" },
                    { label: "Messages", href: "/messages", icon: ArrowRight, gradient: "from-indigo-500 to-indigo-600" },
                ].map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-transparent hover:border-gray-100"
                    >
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
                            <action.icon className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-semibold text-[#E53935] text-center leading-tight">{action.label}</span>
                    </Link>
                ))}
            </div>

            {/* Stats grid — Mobile: 4 visible + show more, Desktop: all visible */}
            {/* Mobile view (< md) */}
            <div className="md:hidden">
                <div className="grid grid-cols-1 gap-4">
                    {mobileVisibleStats.map((stat, i) => renderStatCard(stat, i))}
                </div>
                {hasMoreCards && (
                    <button
                        onClick={() => setShowAllCards(!showAllCards)}
                        className="w-full mt-3 py-2.5 bg-white rounded-xl shadow-sm border border-[#E5E7EB] text-sm font-semibold text-[#E53935] hover:bg-gray-50 hover:border-[#E53935]/20 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        {showAllCards ? (
                            <>Show Less <ChevronUp className="w-4 h-4" /></>
                        ) : (
                            <>Show More ({stats.length - MOBILE_VISIBLE}) <ChevronDown className="w-4 h-4" /></>
                        )}
                    </button>
                )}
            </div>
            {/* Tablet + Desktop view (>= md) — always show all */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => renderStatCard(stat, i))}
            </div>

            {/* Revenue Chart — scrollable on mobile */}
            {isLoading ? (
                <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-center h-[380px]">
                    <Loader2 className="w-6 h-6 text-[#E53935] animate-spin" />
                </div>
            ) : analytics ? (
                <div className="overflow-x-auto -mx-2 px-2 scrollbar-thin">
                    <div className="min-w-[400px]">
                        <RevenueChart
                            data={analytics.revenueByDay}
                            period={period}
                            onPeriodChange={setPeriod}
                            showControls={false}
                        />
                    </div>
                </div>
            ) : null}

            {/* Two column: Products + Orders Status — scrollable on mobile */}
            {analytics && (
                <div className="overflow-x-auto -mx-2 px-2 scrollbar-thin">
                    <div className="min-w-[400px]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <TopProductsChart data={analytics.topProducts} maxItems={5} />
                            <OrderStatusChart data={analytics.ordersByStatus} />
                        </div>
                    </div>
                </div>
            )}

            {/* Category + Recent orders */}
            {analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Category breakdown */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="text-lg font-bold text-[#E53935] mb-4">Sales by Category</h3>
                        {analytics.categoryBreakdown.length === 0 ? (
                            <div className="text-center py-8 text-[#6B7280] text-sm">No category data yet</div>
                        ) : (
                            <div className="space-y-3">
                                {analytics.categoryBreakdown.map((cat) => (
                                    <div key={cat.category}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-[#1A1A1A] font-medium">{cat.category}</span>
                                            <span className="text-[#6B7280]">{formatCurrency(cat.revenue)} · {cat.orders} orders</span>
                                        </div>
                                        <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#E53935] to-[#2563EB] rounded-full transition-all duration-700 ease-out"
                                                style={{ width: `${cat.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent orders */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[#E53935]">Recent Orders</h3>
                            <Link href="/seller/orders" className="text-xs text-[#E53935] font-medium hover:underline flex items-center gap-1">
                                View All <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        {analytics.recentOrders.length === 0 ? (
                            <div className="text-center py-8 text-[#6B7280] text-sm">No orders yet</div>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {analytics.recentOrders.slice(0, 6).map((order) => (
                                    <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-[#E5E7EB]">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#1A1A1A] truncate">{order.productTitle}</p>
                                            <p className="text-xs text-[#6B7280]">#{order.orderNumber.slice(-8)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-[#1A1A1A]">{formatCurrency(order.sellingPrice)}</p>
                                            <p className="text-xs font-semibold text-emerald-600">+{formatCurrency(order.profit)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Getting Started Checklist */}
            {!allDone && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <button
                        onClick={() => setChecklistOpen(!checklistOpen)}
                        className="w-full flex items-center justify-between p-6 pb-4 hover:bg-gray-50/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg">🚀</span>
                            <h3 className="text-[#E53935] font-semibold">Setup Progress</h3>
                            <span className="text-xs text-[#6B7280]">{completedChecklist}/{data.checklist.length} complete</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-[#6B7280]">
                                {Math.round((completedChecklist / data.checklist.length) * 100)}%
                            </span>
                            {checklistOpen ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
                        </div>
                    </button>

                    <div className="px-6 pb-3">
                        <div className="w-full h-2.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#16A34A] to-[#22D3EE] rounded-full transition-all duration-700"
                                style={{ width: `${(completedChecklist / data.checklist.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {checklistOpen && (
                        <div className="px-6 pb-6 space-y-3">
                            {data.checklist.map((item) => (
                                <div key={item.text} className="flex items-center gap-3">
                                    <div
                                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${item.done ? "bg-[#16A34A] scale-100" : "bg-gray-200"
                                            }`}
                                    >
                                        {item.done && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={`text-sm flex-1 ${item.done ? "line-through text-gray-400" : "text-[#1A1A1A]"}`}>
                                        {item.text}
                                    </span>
                                    {!item.done && item.link && (
                                        <Link href={item.link} className="text-xs text-[#E53935] font-medium hover:underline">
                                            Go →
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
      `}</style>
        </div>
    );
}
