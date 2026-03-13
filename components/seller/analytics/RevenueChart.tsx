"use client";

import { useState } from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import type { RevenueDataPoint, AnalyticsPeriod } from "@/lib/types/analytics";
import PeriodSelector from "./PeriodSelector";
import { formatCurrency, formatShortDate, exportToCSV } from "@/lib/utils/format";
import { Download } from "lucide-react";

interface Props {
    data: RevenueDataPoint[];
    period: AnalyticsPeriod;
    onPeriodChange: (period: AnalyticsPeriod) => void;
    showControls?: boolean;
}

type ChartType = "area" | "line" | "bar";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E53935]/20 rounded-xl p-3 shadow-lg">
            <p className="text-xs font-semibold text-[#E53935] mb-1">{formatShortDate(label)}</p>
            {payload.map((p: { name: string; value: number; color: string }) => (
                <p key={p.name} className="text-xs" style={{ color: p.color }}>
                    {p.name}: {formatCurrency(p.value)}
                </p>
            ))}
        </div>
    );
}

export default function RevenueChart({ data, period, onPeriodChange, showControls = true }: Props) {
    const [chartType, setChartType] = useState<ChartType>("area");

    const handleExport = () => {
        exportToCSV(
            data.map((d) => ({ date: d.date, revenue: d.revenue, profit: d.profit, orders: d.orders })),
            "revenue_data"
        );
    };

    const isEmpty = data.every((d) => d.revenue === 0 && d.profit === 0);

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h3 className="text-lg font-bold text-[#E53935]">Revenue & Profit Overview</h3>
                <div className="flex items-center gap-3">
                    {showControls && (
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            {(["area", "line", "bar"] as ChartType[]).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setChartType(t)}
                                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md capitalize transition-colors ${chartType === t ? "bg-[#E53935] text-white" : "text-[#6B7280]"
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    )}
                    <PeriodSelector value={period} onChange={onPeriodChange} />
                    {showControls && (
                        <button
                            onClick={handleExport}
                            className="p-2 text-[#6B7280] hover:text-[#E53935] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Export CSV"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {isEmpty ? (
                <div className="flex items-center justify-center h-[300px] text-[#6B7280] text-sm">
                    No data yet for this period
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    {chartType === "area" ? (
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#E53935" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#E53935" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(v) => formatShortDate(v)} />
                            <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(v) => `$${v}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#E53935" fill="url(#revGrad)" strokeWidth={2} animationDuration={800} />
                            <Area type="monotone" dataKey="profit" name="Profit" stroke="#E53935" fill="url(#profGrad)" strokeWidth={2} animationDuration={800} />
                        </AreaChart>
                    ) : chartType === "line" ? (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(v) => formatShortDate(v)} />
                            <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(v) => `$${v}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#E53935" strokeWidth={2} dot={false} animationDuration={800} />
                            <Line type="monotone" dataKey="profit" name="Profit" stroke="#E53935" strokeWidth={2} dot={false} animationDuration={800} />
                        </LineChart>
                    ) : (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(v) => formatShortDate(v)} />
                            <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(v) => `$${v}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="revenue" name="Revenue" fill="#E53935" radius={[4, 4, 0, 0]} animationDuration={800} />
                            <Bar dataKey="profit" name="Profit" fill="#E53935" radius={[4, 4, 0, 0]} animationDuration={800} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            )}
        </div>
    );
}
