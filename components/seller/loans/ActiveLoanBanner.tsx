"use client";

import Link from "next/link";
import type { LoanRequest } from "@/lib/types/loans";
import { formatCurrency, formatDate } from "@/lib/utils/format";

interface Props {
    loan: LoanRequest | null;
    onRepay?: () => void;
}

export default function ActiveLoanBanner({ loan, onRepay }: Props) {
    if (!loan || loan.status !== "APPROVED" || loan.balanceRemaining <= 0) return null;

    const usedAmount = (loan.approvedAmount ?? loan.amount) - loan.balanceRemaining;
    const remainingPercent = ((loan.balanceRemaining / (loan.approvedAmount ?? loan.amount)) * 100).toFixed(0);

    return (
        <div className="bg-white rounded-2xl border-l-4 border-[#16A34A] shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl">💳</span>
                    <h3 className="text-lg font-bold text-[#E53935]">Active Loan</h3>
                </div>
                <Link
                    href="/seller/loans"
                    className="text-xs text-[#E53935] font-medium hover:underline"
                >
                    Details →
                </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <p className="text-xs text-[#6B7280] mb-1">Available Balance</p>
                    <p className="text-xl font-bold text-[#16A34A]">{formatCurrency(loan.balanceRemaining)}</p>
                </div>
                <div>
                    <p className="text-xs text-[#6B7280] mb-1">Used So Far</p>
                    <p className="text-xl font-bold text-[#1A1A1A]">{formatCurrency(usedAmount)}</p>
                </div>
                <div>
                    <p className="text-xs text-[#6B7280] mb-1">Repaid</p>
                    <p className="text-xl font-bold text-[#1A1A1A]">{formatCurrency(loan.totalRepaid)}</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-[#E5E7EB] rounded-full overflow-hidden mb-3">
                <div
                    className="h-full bg-[#16A34A] rounded-full transition-all duration-700"
                    style={{ width: `${remainingPercent}%` }}
                />
            </div>
            <p className="text-xs text-[#6B7280] mb-4">{remainingPercent}% remaining</p>

            <div className="flex items-center justify-between text-xs text-[#6B7280]">
                <span>Original loan: {formatCurrency(loan.approvedAmount ?? loan.amount)} · Approved: {formatDate(loan.approvedAt ?? loan.createdAt)}</span>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onRepay}
                        className="text-[#E53935] font-medium hover:underline text-xs"
                    >
                        💰 Repay Loan
                    </button>
                    <Link href="/seller/orders" className="text-[#E53935] font-medium hover:underline text-xs">
                        Pay an Order →
                    </Link>
                </div>
            </div>
        </div>
    );
}
