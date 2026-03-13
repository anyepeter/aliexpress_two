"use client";

import type { AnalyticsSummary } from "@/lib/types/analytics";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";
import { DollarSign, TrendingUp, Percent, ShoppingBag, BarChart2, Eye } from "lucide-react";

interface Props {
    data: AnalyticsSummary;
}

export default function AnalyticsKPIRow({ data }: Props) {
    const kpis = [
        { label: "Total Revenue", value: formatCurrency(data.totalRevenue), icon: DollarSign, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
        { label: "Net Profit", value: formatCurrency(data.totalProfit), icon: TrendingUp, iconBg: "bg-green-50", iconColor: "text-green-600" },
        { label: "Profit Margin", value: formatPercent(data.profitMargin), icon: Percent, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
        { label: "Total Orders", value: formatNumber(data.totalOrders), icon: ShoppingBag, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
        { label: "Avg Order Value", value: formatCurrency(data.avgOrderValue), icon: BarChart2, iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
        { label: "Products", value: formatNumber(data.totalProducts), icon: Eye, iconBg: "bg-teal-50", iconColor: "text-teal-600" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {kpis.map((kpi, i) => (
                <div
                    key={kpi.label}
                    className="bg-white rounded-2xl p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                    style={{ animationDelay: `${i * 60}ms` }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-xl ${kpi.iconBg}`}>
                            <kpi.icon className={`w-4 h-4 ${kpi.iconColor}`} />
                        </div>
                    </div>
                    <p className="text-xl font-bold text-[#E53935]">{kpi.value}</p>
                    <p className="text-xs text-[#6B7280] mt-1">{kpi.label}</p>
                </div>
            ))}
        </div>
    );
}
