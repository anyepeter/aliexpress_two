"use client";

import { useState, useEffect } from "react";
import type { LoanRequest } from "@/lib/types/loans";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
    CreditCard,
    CheckCircle2,
    XCircle,
    DollarSign,
    Clock,
    Loader2,
    ChevronDown,
    ChevronUp,
    Settings,
} from "lucide-react";

// ── Loan Settings Panel ──
function LoanSettingsPanel() {
    const [settings, setSettings] = useState<Record<string, number> | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetch("/api/admin/loan-settings")
            .then((r) => r.ok ? r.json() : null)
            .then(setSettings)
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/loan-settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (res.ok) setSettings(await res.json());
        } finally { setSaving(false); }
    };

    if (loading || !settings) return null;

    return (
        <div className="mb-6">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#E53935] transition-colors"
            >
                <Settings className="w-4 h-4" />
                Loan Settings
                {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {open && (
                <div className="mt-3 bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[11px] font-medium text-gray-500 uppercase block mb-1">Daily Interest Rate</label>
                            <div className="flex items-center gap-1">
                                <input type="number" step="0.001" min="0" max="1" value={settings.dailyInterestRate} onChange={(e) => setSettings({ ...settings, dailyInterestRate: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20" />
                                <span className="text-xs text-gray-400 shrink-0">= {((settings.dailyInterestRate ?? 0) * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-[11px] font-medium text-gray-500 uppercase block mb-1">Max Repayment Days</label>
                            <input type="number" min="1" max="365" value={settings.maxRepaymentDays} onChange={(e) => setSettings({ ...settings, maxRepaymentDays: parseInt(e.target.value) || 7 })} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20" />
                        </div>
                        <div>
                            <label className="text-[11px] font-medium text-gray-500 uppercase block mb-1">Min Revenue Required</label>
                            <input type="number" min="0" value={settings.minRevenue} onChange={(e) => setSettings({ ...settings, minRevenue: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20" />
                        </div>
                        <div>
                            <label className="text-[11px] font-medium text-gray-500 uppercase block mb-1">Min Completed Orders</label>
                            <input type="number" min="0" value={settings.minCompletedOrders} onChange={(e) => setSettings({ ...settings, minCompletedOrders: parseInt(e.target.value) || 0 })} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20" />
                        </div>
                        <div>
                            <label className="text-[11px] font-medium text-gray-500 uppercase block mb-1">Min Loan Amount</label>
                            <input type="number" min="0" value={settings.minLoanAmount} onChange={(e) => setSettings({ ...settings, minLoanAmount: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20" />
                        </div>
                        <div>
                            <label className="text-[11px] font-medium text-gray-500 uppercase block mb-1">Max Loan Amount</label>
                            <input type="number" min="0" value={settings.maxLoanAmount} onChange={(e) => setSettings({ ...settings, maxLoanAmount: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20" />
                        </div>
                    </div>
                    <button onClick={handleSave} disabled={saving} className="mt-4 px-5 py-2 bg-[#E53935] text-white text-sm font-semibold rounded-xl hover:bg-[#C62828] transition-colors disabled:opacity-50">
                        {saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            )}
        </div>
    );
}

type Tab = "PENDING" | "APPROVED" | "REJECTED" | "all";

export default function AdminLoansClient() {
    const [loans, setLoans] = useState<LoanRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("PENDING");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchLoans = async (status: Tab) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/loans?status=${status}`);
            if (res.ok) setLoans(await res.json());
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans(activeTab);
    }, [activeTab]);

    const handleAction = async (
        loanId: string,
        action: "APPROVE" | "REJECT",
        approvedAmount?: number,
        adminNote?: string
    ) => {
        setProcessingId(loanId);
        try {
            const res = await fetch(`/api/admin/loans/${loanId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, approvedAmount, adminNote }),
            });
            if (res.ok) {
                fetchLoans(activeTab);
            }
        } catch { /* silent */ } finally {
            setProcessingId(null);
        }
    };

    // Stats
    const allLoans = loans;
    const totalLoanedOut = allLoans.filter((l) => l.status === "APPROVED" || l.status === "REPAID").reduce((s, l) => s + (l.approvedAmount ?? 0), 0);
    const totalRepaid = allLoans.reduce((s, l) => s + l.totalRepaid, 0);
    const outstanding = allLoans.filter((l) => l.status === "APPROVED").reduce((s, l) => s + l.balanceRemaining, 0);
    const activeCount = allLoans.filter((l) => l.status === "APPROVED").length;
    const pendingCount = allLoans.filter((l) => l.status === "PENDING").length;

    const statCards = [
        { label: "Total Loaned Out", value: formatCurrency(totalLoanedOut), icon: DollarSign, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
        { label: "Total Repaid", value: formatCurrency(totalRepaid), icon: CheckCircle2, iconBg: "bg-green-50", iconColor: "text-green-600" },
        { label: "Outstanding", value: formatCurrency(outstanding), icon: CreditCard, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
        { label: "Active Loans", value: `${activeCount} sellers`, icon: CreditCard, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
        { label: "Pending Review", value: `${pendingCount} requests`, icon: Clock, iconBg: "bg-red-50", iconColor: "text-red-600" },
    ];

    const tabs: { label: string; value: Tab; count: number }[] = [
        { label: "Pending", value: "PENDING", count: pendingCount },
        { label: "Approved", value: "APPROVED", count: activeCount },
        { label: "Rejected", value: "REJECTED", count: allLoans.filter((l) => l.status === "REJECTED").length },
        { label: "All", value: "all", count: allLoans.length },
    ];

    return (
        <>
            {/* Loan Settings */}
            <LoanSettingsPanel />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {statCards.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-[#6B7280]">{stat.label}</span>
                            <div className={`p-1.5 rounded-lg ${stat.iconBg}`}>
                                <stat.icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
                            </div>
                        </div>
                        <p className="text-lg font-bold text-[#1A1A1A]">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${activeTab === tab.value
                                ? "bg-[#E53935] text-white"
                                : "bg-gray-100 text-[#6B7280] hover:bg-gray-200"
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Loan list */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-[#E53935] animate-spin" />
                </div>
            ) : loans.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                    <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-[#6B7280]">No loan requests found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {loans.map((loan) => (
                        <LoanCard
                            key={loan.id}
                            loan={loan}
                            expanded={expandedId === loan.id}
                            onToggle={() => setExpandedId(expandedId === loan.id ? null : loan.id)}
                            processing={processingId === loan.id}
                            onAction={handleAction}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

function LoanCard({
    loan,
    expanded,
    onToggle,
    processing,
    onAction,
}: {
    loan: LoanRequest;
    expanded: boolean;
    onToggle: () => void;
    processing: boolean;
    onAction: (id: string, action: "APPROVE" | "REJECT", amount?: number, note?: string) => void;
}) {
    const [approveAmount, setApproveAmount] = useState(String(loan.amount));
    const [adminNote, setAdminNote] = useState("");
    const [confirmAction, setConfirmAction] = useState<"APPROVE" | "REJECT" | null>(null);

    const statusBadge = {
        PENDING: "bg-amber-50 text-amber-700 border-amber-200",
        APPROVED: "bg-green-50 text-green-700 border-green-200",
        REJECTED: "bg-red-50 text-red-700 border-red-200",
        REPAID: "bg-gray-100 text-gray-600 border-gray-200",
        CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
    }[loan.status];

    const handleConfirm = () => {
        if (confirmAction === "APPROVE") {
            onAction(loan.id, "APPROVE", parseFloat(approveAmount), adminNote);
        } else if (confirmAction === "REJECT") {
            onAction(loan.id, "REJECT", undefined, adminNote);
        }
        setConfirmAction(null);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#E5E7EB]">
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors text-left"
            >
                {/* Store logo */}
                <div className="w-10 h-10 rounded-full bg-[#E53935] flex items-center justify-center flex-shrink-0">
                    {loan.store?.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={loan.store.logoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <span className="text-white text-sm font-bold">
                            {loan.seller?.firstName?.[0] ?? "?"}
                        </span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#1A1A1A]">{loan.store?.storeName ?? "Store"}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                            {loan.status === "PENDING" ? "⏳ Pending" : loan.status}
                        </span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                        {loan.seller?.firstName} {loan.seller?.lastName} · {formatDate(loan.createdAt)}
                    </p>
                </div>

                <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-[#E53935]">{formatCurrency(loan.amount)}</p>
                    <p className="text-[11px] text-[#6B7280]">Requested</p>
                </div>

                {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {expanded && (
                <div className="border-t border-[#E5E7EB] p-5 bg-gray-50/30 space-y-4">
                    {/* Reason */}
                    <div>
                        <p className="text-xs font-semibold text-[#6B7280] uppercase mb-1">Reason</p>
                        <p className="text-sm text-[#1A1A1A] bg-white p-3 rounded-lg border border-[#E5E7EB]">&quot;{loan.reason}&quot;</p>
                    </div>

                    {/* Loan history info */}
                    <div className="text-xs text-[#6B7280]">
                        Transactions: {loan.transactions.length} | Total Repaid: {formatCurrency(loan.totalRepaid)}
                    </div>

                    {/* Action section — only for PENDING */}
                    {loan.status === "PENDING" && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-[#6B7280] font-medium block mb-1">
                                        Approve amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">$</span>
                                        <input
                                            type="number"
                                            value={approveAmount}
                                            onChange={(e) => setApproveAmount(e.target.value)}
                                            className="w-full pl-7 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-[#6B7280] font-medium block mb-1">
                                        Admin note
                                    </label>
                                    <input
                                        type="text"
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder="Optional note..."
                                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                                    />
                                </div>
                            </div>

                            {/* Confirmation dialog */}
                            {confirmAction && (
                                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                                    <p className="text-sm font-medium text-[#1A1A1A] mb-3">
                                        {confirmAction === "APPROVE"
                                            ? `Approve loan of ${formatCurrency(parseFloat(approveAmount) || 0)}?`
                                            : "Reject this loan request?"}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setConfirmAction(null)}
                                            className="px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirm}
                                            disabled={processing}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg text-white flex items-center gap-2 ${confirmAction === "APPROVE" ? "bg-[#16A34A] hover:bg-green-700" : "bg-[#DC2626] hover:bg-red-700"
                                                } disabled:opacity-50`}
                                        >
                                            {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                            Confirm {confirmAction === "APPROVE" ? "Approval" : "Rejection"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!confirmAction && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setConfirmAction("APPROVE")}
                                        disabled={processing}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Approve Loan
                                    </button>
                                    <button
                                        onClick={() => setConfirmAction("REJECT")}
                                        disabled={processing}
                                        className="flex items-center gap-2 px-4 py-2.5 border border-[#DC2626] text-[#DC2626] text-sm font-medium rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Show admin note for non-pending */}
                    {loan.status !== "PENDING" && loan.adminNote && (
                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-3">
                            <p className="text-xs font-semibold text-[#6B7280] mb-1">Admin Note</p>
                            <p className="text-sm text-[#1A1A1A]">{loan.adminNote}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
