"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  DollarSign,
  Store,
  Eye,
  Package,
  Crown,
  Clock,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  UserPlus,
  CheckCircle2,
  XCircle,
  Truck,
} from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  users: {
    total: number;
    sellers: number;
    buyers: number;
    newThisMonth: number;
    newPrevMonth: number;
    active: number;
    suspended: number;
  };
  orders: {
    total: number;
    thisMonth: number;
    prevMonth: number;
    pending: number;
    completed: number;
    rejected: number;
    shipping: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    prevMonth: number;
    thisWeek: number;
  };
  charts: {
    ordersByDay: { date: string; count: number; revenue: number }[];
    usersByDay: { date: string; buyers: number; sellers: number }[];
  };
  topStores: {
    id: string;
    storeName: string;
    ownerName: string;
    ownerAvatar: string | null;
    revenue: number;
    orders: number;
    views: number;
    products: number;
    isPremium: boolean;
  }[];
  pending: {
    approvals: number;
    withdrawals: number;
    loans: number;
  };
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function MiniBarChart({
  data,
  dataKey,
  color,
  height = 60,
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  color: string;
  height?: number;
}) {
  const values = data.map((d) => (Number(d[dataKey]) || 0));
  const max = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all duration-300"
          style={{
            height: `${Math.max((v / max) * 100, 2)}%`,
            backgroundColor: color,
            opacity: i >= values.length - 7 ? 1 : 0.4,
          }}
          title={`${data[i]?.date ?? ""}: ${v}`}
        />
      ))}
    </div>
  );
}

function ChangeIndicator({ current, previous }: { current: number; previous: number }) {
  const change = pctChange(current, previous);
  const isPositive = change >= 0;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
        isPositive ? "text-emerald-600" : "text-red-500"
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      {Math.abs(change)}%
    </span>
  );
}

type ChartTab = "orders" | "revenue" | "users";

export default function AdminAnalyticsClient({ data }: { data: AnalyticsData }) {
  const [chartTab, setChartTab] = useState<ChartTab>("orders");

  const revenueChange = pctChange(data.revenue.thisMonth, data.revenue.prevMonth);
  const ordersChange = pctChange(data.orders.thisMonth, data.orders.prevMonth);
  const usersChange = pctChange(data.users.newThisMonth, data.users.newPrevMonth);

  // Order status breakdown for donut
  const orderStatuses = [
    { label: "Completed", count: data.orders.completed, color: "#10b981" },
    { label: "Shipping", count: data.orders.shipping, color: "#3b82f6" },
    { label: "Pending", count: data.orders.pending, color: "#f59e0b" },
    { label: "Rejected", count: data.orders.rejected, color: "#ef4444" },
  ];
  const orderTotal = Math.max(orderStatuses.reduce((s, o) => s + o.count, 0), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Platform performance overview — last 30 days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#E53935]" />
          <span className="text-sm font-medium text-gray-500">Real-time data</span>
        </div>
      </div>

      {/* ───── Top KPI Cards ───── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(data.revenue.total)}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">
              {formatCurrency(data.revenue.thisMonth)} this month
            </span>
            <ChangeIndicator current={data.revenue.thisMonth} previous={data.revenue.prevMonth} />
          </div>
          <div className="mt-3">
            <MiniBarChart
              data={data.charts.ordersByDay}
              dataKey="revenue"
              color="#10b981"
              height={40}
            />
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-50">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.orders.total}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">
              {data.orders.thisMonth} this month
            </span>
            <ChangeIndicator current={data.orders.thisMonth} previous={data.orders.prevMonth} />
          </div>
          <div className="mt-3">
            <MiniBarChart
              data={data.charts.ordersByDay}
              dataKey="count"
              color="#3b82f6"
              height={40}
            />
          </div>
        </div>

        {/* Users */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Total Users</span>
            <div className="p-2 rounded-xl bg-purple-50">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.users.total}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">
              +{data.users.newThisMonth} new this month
            </span>
            <ChangeIndicator current={data.users.newThisMonth} previous={data.users.newPrevMonth} />
          </div>
          <div className="mt-3">
            <MiniBarChart
              data={data.charts.usersByDay.map((d) => ({
                ...d,
                total: d.buyers + d.sellers,
              }))}
              dataKey="total"
              color="#8b5cf6"
              height={40}
            />
          </div>
        </div>

        {/* Weekly Revenue */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">This Week</span>
            <div className="p-2 rounded-xl bg-amber-50">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(data.revenue.thisWeek)}
          </p>
          <div className="mt-3 text-xs text-gray-400">
            Revenue from last 7 days
          </div>
          <div className="mt-3">
            <MiniBarChart
              data={data.charts.ordersByDay.slice(-7)}
              dataKey="revenue"
              color="#f59e0b"
              height={40}
            />
          </div>
        </div>
      </div>

      {/* ───── Charts Section ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          {/* Chart Tabs */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#E53935]" />
              Performance Trends
            </h2>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              {([
                { key: "orders", label: "Orders" },
                { key: "revenue", label: "Revenue" },
                { key: "users", label: "Users" },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setChartTab(tab.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    chartTab === tab.key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* CSS Bar Chart */}
          <div className="h-[220px] flex items-end gap-[3px]">
            {chartTab === "orders" &&
              data.charts.ordersByDay.map((d, i) => {
                const max = Math.max(...data.charts.ordersByDay.map((x) => x.count), 1);
                return (
                  <div key={i} className="flex-1 group relative">
                    <div
                      className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600 cursor-pointer"
                      style={{ height: `${Math.max((d.count / max) * 100, 1)}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                      {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      : {d.count} orders
                    </div>
                  </div>
                );
              })}
            {chartTab === "revenue" &&
              data.charts.ordersByDay.map((d, i) => {
                const max = Math.max(...data.charts.ordersByDay.map((x) => x.revenue), 1);
                return (
                  <div key={i} className="flex-1 group relative">
                    <div
                      className="w-full bg-emerald-500 rounded-t-sm transition-all duration-300 hover:bg-emerald-600 cursor-pointer"
                      style={{ height: `${Math.max((d.revenue / max) * 100, 1)}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                      {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      : ${d.revenue.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            {chartTab === "users" &&
              data.charts.usersByDay.map((d, i) => {
                const maxVal = Math.max(
                  ...data.charts.usersByDay.map((x) => x.buyers + x.sellers),
                  1
                );
                const total = d.buyers + d.sellers;
                return (
                  <div key={i} className="flex-1 group relative flex flex-col justify-end">
                    {d.sellers > 0 && (
                      <div
                        className="w-full bg-amber-500 rounded-t-sm"
                        style={{ height: `${(d.sellers / maxVal) * 100}%` }}
                      />
                    )}
                    {d.buyers > 0 && (
                      <div
                        className={`w-full bg-purple-500 ${d.sellers === 0 ? "rounded-t-sm" : ""}`}
                        style={{ height: `${(d.buyers / maxVal) * 100}%` }}
                      />
                    )}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                      {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      : {total} ({d.buyers}B, {d.sellers}S)
                    </div>
                  </div>
                );
              })}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-2 text-[10px] text-gray-400">
            <span>
              {new Date(data.charts.ordersByDay[0]?.date ?? "").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>
              {new Date(
                data.charts.ordersByDay[Math.floor(data.charts.ordersByDay.length / 2)]?.date ?? ""
              ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span>Today</span>
          </div>

          {chartTab === "users" && (
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Buyers
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Sellers
              </span>
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E53935]" />
            Order Status
          </h2>

          {/* Visual donut-like progress bars */}
          <div className="space-y-4 mb-6">
            {orderStatuses.map(({ label, count, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(count / orderTotal) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  {((count / orderTotal) * 100).toFixed(1)}% of total
                </span>
              </div>
            ))}
          </div>

          {/* Status icons */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-gray-600">{data.orders.completed} done</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600">{data.orders.shipping} shipping</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-gray-600">{data.orders.pending} pending</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-gray-600">{data.orders.rejected} rejected</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───── User Breakdown + Pending Actions ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E53935]" />
            User Breakdown
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Buyers</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{data.users.buyers}</p>
              <p className="text-xs text-blue-600 mt-1">
                {data.users.total > 0
                  ? ((data.users.buyers / data.users.total) * 100).toFixed(1)
                  : 0}
                % of users
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">Sellers</span>
              </div>
              <p className="text-2xl font-bold text-amber-900">{data.users.sellers}</p>
              <p className="text-xs text-amber-600 mt-1">
                {data.users.total > 0
                  ? ((data.users.sellers / data.users.total) * 100).toFixed(1)
                  : 0}
                % of users
              </p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-900">Active</span>
              </div>
              <p className="text-2xl font-bold text-emerald-900">{data.users.active}</p>
              <p className="text-xs text-emerald-600 mt-1">
                {data.users.total > 0
                  ? ((data.users.active / data.users.total) * 100).toFixed(1)
                  : 0}
                % of users
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Suspended</span>
              </div>
              <p className="text-2xl font-bold text-red-900">{data.users.suspended}</p>
              <p className="text-xs text-red-600 mt-1">
                {data.users.total > 0
                  ? ((data.users.suspended / data.users.total) * 100).toFixed(1)
                  : 0}
                % of users
              </p>
            </div>
          </div>

          <div className="mt-5 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Growth this month</span>
              <ChangeIndicator current={data.users.newThisMonth} previous={data.users.newPrevMonth} />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-900">+{data.users.newThisMonth}</span>
              <span className="text-xs text-gray-400">
                vs +{data.users.newPrevMonth} prev month
              </span>
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#E53935]" />
            Pending Actions
          </h2>

          <div className="space-y-3">
            <Link
              href="/admin/sellers"
              className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors group"
            >
              <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
                <Users className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Seller Approvals</p>
                <p className="text-xs text-gray-500">Review pending seller applications</p>
              </div>
              <span className="text-2xl font-bold text-amber-700">
                {data.pending.approvals}
              </span>
            </Link>

            <Link
              href="/admin/payments"
              className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
            >
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Wallet className="w-5 h-5 text-blue-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Withdrawals</p>
                <p className="text-xs text-gray-500">Process pending withdrawal requests</p>
              </div>
              <span className="text-2xl font-bold text-blue-700">
                {data.pending.withdrawals}
              </span>
            </Link>

            <Link
              href="/admin/loans"
              className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
            >
              <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                <CreditCard className="w-5 h-5 text-purple-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Loan Requests</p>
                <p className="text-xs text-gray-500">Review seller loan applications</p>
              </div>
              <span className="text-2xl font-bold text-purple-700">
                {data.pending.loans}
              </span>
            </Link>
          </div>

          {/* Revenue Summary */}
          <div className="mt-5 p-4 bg-gradient-to-r from-[#E53935] to-[#C62828] rounded-xl text-white">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm font-medium text-white/80">Revenue Summary</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/60">This Month</p>
                <p className="text-xl font-bold">{formatCurrency(data.revenue.thisMonth)}</p>
              </div>
              <div>
                <p className="text-xs text-white/60">All Time</p>
                <p className="text-xl font-bold">{formatCurrency(data.revenue.total)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              {revenueChange >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {revenueChange >= 0 ? "+" : ""}
                {revenueChange}% vs last month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ───── Top Sellers Table ───── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-[#E53935]" />
            Top Performing Stores
          </h2>
          <Link
            href="/admin/sellers"
            className="text-xs text-[#E53935] font-medium hover:underline"
          >
            View all sellers →
          </Link>
        </div>

        {data.topStores.length === 0 ? (
          <div className="py-12 text-center">
            <Store className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No stores yet</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="hidden md:grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>#</span>
              <span>Store</span>
              <span>Revenue</span>
              <span>Orders</span>
              <span>Products</span>
              <span>Views</span>
            </div>

            <div className="divide-y divide-gray-50">
              {data.topStores.map((store, index) => (
                <div
                  key={store.id}
                  className="grid grid-cols-1 md:grid-cols-[40px_2fr_1fr_1fr_1fr_1fr] gap-3 md:gap-4 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-sm font-bold text-gray-300">
                    {index + 1}
                  </span>

                  <div className="flex items-center gap-3">
                    {store.ownerAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={store.ownerAvatar}
                        alt={store.ownerName}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-gray-600">
                          {store.ownerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1.5">
                        {store.storeName}
                        {store.isPremium && (
                          <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        )}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{store.ownerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500 md:hidden" />
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(store.revenue)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-500 md:hidden" />
                    <span className="text-sm text-gray-600">{store.orders}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-purple-500 md:hidden" />
                    <span className="text-sm text-gray-600">{store.products}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-gray-400 md:hidden" />
                    <span className="text-sm text-gray-600">
                      {store.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ───── Quick Stats Footer ───── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-5">
          <ShoppingBag className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{data.orders.thisMonth}</p>
          <p className="text-xs text-white/70 mt-1">Orders this month</p>
          <div className="mt-2 flex items-center gap-1 text-sm">
            {ordersChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{ordersChange >= 0 ? "+" : ""}{ordersChange}%</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-5">
          <DollarSign className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{formatCurrency(data.revenue.thisWeek)}</p>
          <p className="text-xs text-white/70 mt-1">Revenue this week</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-5">
          <UserPlus className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">+{data.users.newThisMonth}</p>
          <p className="text-xs text-white/70 mt-1">New users this month</p>
          <div className="mt-2 flex items-center gap-1 text-sm">
            {usersChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{usersChange >= 0 ? "+" : ""}{usersChange}%</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#E53935] to-[#C62828] text-white rounded-2xl p-5">
          <Activity className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{data.users.sellers}</p>
          <p className="text-xs text-white/70 mt-1">Active sellers</p>
        </div>
      </div>
    </div>
  );
}
