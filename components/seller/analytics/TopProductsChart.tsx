"use client";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import type { TopProduct } from "@/lib/types/analytics";
import { formatCurrency } from "@/lib/utils/format";

interface Props {
    data: TopProduct[];
    maxItems?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
        <div className="bg-white border border-[#E53935]/20 rounded-xl p-3 shadow-lg">
            <p className="text-xs font-semibold text-[#E53935] mb-1">{d.title}</p>
            <p className="text-xs text-[#6B7280]">{d.orders} orders</p>
            <p className="text-xs text-[#E53935]">Revenue: {formatCurrency(d.revenue)}</p>
            <p className="text-xs text-[#E53935]">Profit: {formatCurrency(d.profit)}</p>
        </div>
    );
}

export default function TopProductsChart({ data, maxItems = 5 }: Props) {
    const chartData = data.slice(0, maxItems).map((d) => ({
        ...d,
        shortTitle: d.title.length > 20 ? d.title.slice(0, 20) + "…" : d.title,
    }));

    const isEmpty = chartData.length === 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#E53935] mb-4">Top Performing Products</h3>
            {isEmpty ? (
                <div className="flex items-center justify-center h-[300px] text-[#6B7280] text-sm">
                    No product data yet
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(v) => `$${v}`} />
                        <YAxis type="category" dataKey="shortTitle" tick={{ fontSize: 11, fill: "#6B7280" }} width={130} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" name="Revenue" fill="#E53935" radius={[0, 4, 4, 0]} animationDuration={800} />
                        <Bar dataKey="profit" name="Profit" fill="#E53935" radius={[0, 4, 4, 0]} animationDuration={800} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
