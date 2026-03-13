"use client";

import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import type { MonthlyData } from "@/lib/types/analytics";
import { formatCurrency } from "@/lib/utils/format";

interface Props {
    data: MonthlyData[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E53935]/20 rounded-xl p-3 shadow-lg">
            <p className="text-xs font-semibold text-[#E53935] mb-1">{label}</p>
            {payload.map((p: { name: string; value: number; color: string }) => (
                <p key={p.name} className="text-xs" style={{ color: p.color }}>
                    {p.name}: {p.name === "Orders" ? p.value : formatCurrency(p.value)}
                </p>
            ))}
        </div>
    );
}

export default function MonthlyTrendChart({ data }: Props) {
    const isEmpty = data.every((d) => d.revenue === 0 && d.profit === 0);

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#E53935] mb-4">Monthly Trend</h3>
            {isEmpty ? (
                <div className="flex items-center justify-center h-[300px] text-[#6B7280] text-sm">
                    No monthly data yet
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(v) => `$${v}`} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#6B7280" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#E53935" radius={[4, 4, 0, 0]} animationDuration={800} />
                        <Line yAxisId="left" type="monotone" dataKey="profit" name="Profit" stroke="#E53935" strokeWidth={2} dot={{ fill: "#E53935", r: 4 }} animationDuration={800} />
                        <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#16A34A" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#16A34A", r: 3 }} animationDuration={800} />
                    </ComposedChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
