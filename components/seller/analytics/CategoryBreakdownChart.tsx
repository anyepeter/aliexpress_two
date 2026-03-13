"use client";

import {
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    Tooltip,
    Legend,
} from "recharts";
import type { CategoryData } from "@/lib/types/analytics";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

interface Props {
    data: CategoryData[];
}

const COLORS = ["#E53935", "#E53935", "#16A34A", "#8B5CF6", "#06B6D4", "#EC4899", "#F59E0B", "#6366F1"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
        <div className="bg-white border border-[#E53935]/20 rounded-xl p-3 shadow-lg">
            <p className="text-xs font-semibold text-[#E53935] mb-1">{d.category}</p>
            <p className="text-xs text-[#6B7280]">{d.orders} orders</p>
            <p className="text-xs text-[#E53935]">Revenue: {formatCurrency(d.revenue)}</p>
            <p className="text-xs text-[#E53935]">{formatPercent(d.percentage)} of total</p>
        </div>
    );
}

export default function CategoryBreakdownChart({ data }: Props) {
    const isEmpty = data.length === 0;

    const chartData = data.map((d, i) => ({
        ...d,
        name: d.category,
        fill: COLORS[i % COLORS.length],
        value: d.percentage,
    }));

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#E53935] mb-4">Sales by Category</h3>
            {isEmpty ? (
                <div className="flex items-center justify-center h-[300px] text-[#6B7280] text-sm">
                    No category data yet
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="20%"
                        outerRadius="90%"
                        data={chartData}
                        startAngle={180}
                        endAngle={0}
                    >
                        <RadialBar
                            dataKey="value"
                            animationDuration={800}
                            cornerRadius={4}
                            label={{ fill: "#6B7280", fontSize: 10, position: "insideStart" }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            formatter={(value) => <span className="text-xs text-[#6B7280]">{value}</span>}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
