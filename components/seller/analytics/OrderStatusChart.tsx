"use client";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from "recharts";
import type { OrderStatusCount } from "@/lib/types/analytics";

interface Props {
    data: OrderStatusCount[];
}

const STATUS_LABELS: Record<string, string> = {
    PENDING: "Pending",
    CONTACTED_ADMIN: "Contacted",
    SHIPPING: "Shipping",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
        <div className="bg-white border border-[#E53935]/20 rounded-xl p-3 shadow-lg">
            <p className="text-xs font-semibold" style={{ color: d.payload.color }}>
                {STATUS_LABELS[d.payload.status] || d.payload.status}
            </p>
            <p className="text-xs text-[#6B7280]">{d.value} orders</p>
        </div>
    );
}

export default function OrderStatusChart({ data }: Props) {
    const totalOrders = data.reduce((sum, d) => sum + d.count, 0);
    const isEmpty = data.length === 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#E53935] mb-4">Orders by Status</h3>
            {isEmpty ? (
                <div className="flex items-center justify-center h-[300px] text-[#6B7280] text-sm">
                    No order data yet
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data.map((d) => ({ ...d, name: STATUS_LABELS[d.status] || d.status }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="count"
                            animationDuration={800}
                            label={false}
                        >
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            formatter={(value) => <span className="text-xs text-[#6B7280]">{value}</span>}
                        />
                        {/* Center label */}
                        <text x="50%" y="47%" textAnchor="middle" className="text-xs fill-[#6B7280]">
                            Total
                        </text>
                        <text x="50%" y="55%" textAnchor="middle" className="text-lg font-bold fill-[#E53935]">
                            {totalOrders}
                        </text>
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
