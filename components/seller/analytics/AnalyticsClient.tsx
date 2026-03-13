"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { AnalyticsPeriod } from "@/lib/types/analytics";
import { useSellerAnalytics } from "@/lib/hooks/useSellerAnalytics";
import AnalyticsKPIRow from "@/components/seller/analytics/AnalyticsKPIRow";
import RevenueChart from "@/components/seller/analytics/RevenueChart";
import TopProductsChart from "@/components/seller/analytics/TopProductsChart";
import OrderStatusChart from "@/components/seller/analytics/OrderStatusChart";
import CategoryBreakdownChart from "@/components/seller/analytics/CategoryBreakdownChart";
import MonthlyTrendChart from "@/components/seller/analytics/MonthlyTrendChart";
import RecentOrdersTable from "@/components/seller/analytics/RecentOrdersTable";
import PeriodSelector from "@/components/seller/analytics/PeriodSelector";
import { Loader2 } from "lucide-react";

export default function AnalyticsClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialPeriod = (searchParams.get("period") || "30d") as AnalyticsPeriod;
    const [period, setPeriod] = useState<AnalyticsPeriod>(initialPeriod);

    const { data, isLoading } = useSellerAnalytics(period);

    const handlePeriodChange = (newPeriod: AnalyticsPeriod) => {
        setPeriod(newPeriod);
        router.push(`/seller/analytics?period=${newPeriod}`, { scroll: false });
    };

    if (isLoading || !data) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#E53935] animate-spin" />
            </div>
        );
    }

    return (
        <>
            {/* Header with period selector */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#E53935]">Analytics</h1>
                    <p className="text-[#6B7280] mt-1">Track your store performance and growth</p>
                </div>
                <PeriodSelector value={period} onChange={handlePeriodChange} />
            </div>

            {/* KPI Cards */}
            <AnalyticsKPIRow data={data.summary} />

            {/* Revenue Chart */}
            <RevenueChart
                data={data.revenueByDay}
                period={period}
                onPeriodChange={handlePeriodChange}
                showControls={true}
            />

            {/* Products + Orders Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopProductsChart data={data.topProducts} maxItems={8} />
                <OrderStatusChart data={data.ordersByStatus} />
            </div>

            {/* Category + Monthly Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <CategoryBreakdownChart data={data.categoryBreakdown} />
                <MonthlyTrendChart data={data.monthlyTrend} />
            </div>

            {/* Recent Orders Table */}
            <RecentOrdersTable data={data.recentOrders} />
        </>
    );
}
