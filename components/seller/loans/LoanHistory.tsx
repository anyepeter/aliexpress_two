"use client";

import type { LoanRequest, LoanStatus } from "@/lib/types/loans";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import LoanTransactionAccordion from "./LoanTransactionAccordion";

interface Props {
    loans: LoanRequest[];
}

const STATUS_BADGES: Record<LoanStatus, { label: string; className: string }> = {
    PENDING: { label: "⏳ Pending Review", className: "bg-amber-50 text-amber-700 border-amber-200" },
    APPROVED: { label: "✅ Active", className: "bg-green-50 text-green-700 border-green-200" },
    REJECTED: { label: "❌ Rejected", className: "bg-red-50 text-red-700 border-red-200" },
    REPAID: { label: "✓ Fully Repaid", className: "bg-gray-100 text-gray-700 border-gray-200" },
    CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-500 border-gray-200" },
};

export default function LoanHistory({ loans }: Props) {
    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
                <h3 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
                    📜 Loan History
                </h3>
            </div>

            <div className="p-4">
                {loans.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-[#6B7280] text-sm">No loan history yet</p>
                        <p className="text-xs text-gray-400 mt-1">Your loan requests will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {loans.map((loan) => {
                            const badge = STATUS_BADGES[loan.status];
                            return (
                                <div
                                    key={loan.id}
                                    className="border border-[#E5E7EB] rounded-xl p-4"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="text-sm text-[#6B7280]">{formatDate(loan.createdAt)}</p>
                                            <p className="text-sm font-medium text-[#1A1A1A] mt-0.5">
                                                {formatCurrency(loan.amount)} requested
                                            </p>
                                        </div>
                                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badge.className}`}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    {loan.status === "APPROVED" && (
                                        <div className="flex items-center gap-4 text-xs text-[#6B7280] mt-1">
                                            <span>Approved: {formatCurrency(loan.approvedAmount ?? loan.amount)}</span>
                                            <span>Balance: <span className="text-[#16A34A] font-medium">{formatCurrency(loan.balanceRemaining)}</span></span>
                                            <span>Repaid: {formatCurrency(loan.totalRepaid)}</span>
                                        </div>
                                    )}

                                    {loan.status === "REPAID" && (
                                        <p className="text-xs text-[#6B7280] mt-1">
                                            Approved: {formatCurrency(loan.approvedAmount ?? loan.amount)} · Fully repaid
                                        </p>
                                    )}

                                    {loan.status === "REJECTED" && loan.adminNote && (
                                        <div className="bg-red-50 rounded-lg px-3 py-2 mt-2">
                                            <p className="text-xs text-red-600">
                                                <span className="font-medium">Admin note:</span> {loan.adminNote}
                                            </p>
                                        </div>
                                    )}

                                    <LoanTransactionAccordion transactions={loan.transactions} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
