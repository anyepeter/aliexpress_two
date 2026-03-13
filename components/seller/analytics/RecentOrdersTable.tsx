"use client";

import { useState } from "react";
import type { RecentOrder } from "@/lib/types/analytics";
import { formatCurrency, formatDate, exportToCSV } from "@/lib/utils/format";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
    data: RecentOrder[];
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
    PENDING: { label: "⏳ Pending", className: "bg-amber-50 text-amber-700" },
    CONTACTED_ADMIN: { label: "📞 Contacted", className: "bg-blue-50 text-blue-700" },
    SHIPPING: { label: "🚚 Shipping", className: "bg-indigo-50 text-indigo-700" },
    COMPLETED: { label: "✅ Done", className: "bg-green-50 text-green-700" },
    REJECTED: { label: "❌ Rejected", className: "bg-red-50 text-red-700" },
};

const PAGE_SIZE = 10;

export default function RecentOrdersTable({ data }: Props) {
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");

    const filtered = search
        ? data.filter(
            (o) =>
                o.productTitle.toLowerCase().includes(search.toLowerCase()) ||
                o.orderNumber.toLowerCase().includes(search.toLowerCase())
        )
        : data;

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const handleExport = () => {
        exportToCSV(
            data.map((o) => ({
                orderNumber: o.orderNumber,
                product: o.productTitle,
                sellingPrice: o.sellingPrice,
                baseCost: o.basePrice,
                profit: o.profit,
                status: o.status,
                date: o.createdAt,
            })),
            "recent_orders"
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm mt-6 overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-4 flex-wrap gap-3">
                <h3 className="text-lg font-bold text-[#E53935]">Recent Orders</h3>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 w-48"
                    />
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-12 text-[#6B7280] text-sm">No orders found</div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-t border-b border-[#E5E7EB] bg-gray-50/50">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Order</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Product</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Sell Price</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Base Cost</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Profit</th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB]">
                                {pageData.map((order) => {
                                    const badge = STATUS_BADGES[order.status] || { label: order.status, className: "bg-gray-50 text-gray-700" };
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-3 text-xs font-medium text-[#E53935]">#{order.orderNumber.slice(-8)}</td>
                                            <td className="px-6 py-3">
                                                <p className="text-xs text-[#1A1A1A] truncate max-w-[180px]">{order.productTitle}</p>
                                            </td>
                                            <td className="px-6 py-3 text-right text-xs text-[#1A1A1A]">{formatCurrency(order.sellingPrice)}</td>
                                            <td className="px-6 py-3 text-right text-xs font-semibold text-[#E53935]">{formatCurrency(order.basePrice)}</td>
                                            <td className="px-6 py-3 text-right text-xs font-semibold text-[#E53935]">+{formatCurrency(order.profit)}</td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right text-xs text-[#6B7280]">{formatDate(order.createdAt)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB]">
                            <p className="text-xs text-[#6B7280]">
                                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-30 hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i)}
                                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === i ? "bg-[#E53935] text-white" : "text-[#6B7280] hover:bg-gray-100"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                    disabled={page === totalPages - 1}
                                    className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-30 hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
