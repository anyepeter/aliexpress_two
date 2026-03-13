"use client";

import { useState } from "react";
import type { LoanTransaction } from "@/lib/types/loans";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
    transactions: LoanTransaction[];
}

export default function LoanTransactionAccordion({ transactions }: Props) {
    const [open, setOpen] = useState(false);

    if (transactions.length === 0) return null;

    return (
        <div className="mt-3">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 text-xs text-[#E53935] font-medium hover:underline"
            >
                {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                Transactions ({transactions.length})
            </button>

            {open && (
                <div className="mt-2 bg-gray-50 rounded-lg border border-[#E5E7EB] divide-y divide-[#E5E7EB]">
                    {transactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between px-3 py-2 text-xs">
                            <div className="flex items-center gap-3">
                                <span className="text-[#6B7280]">{formatDate(t.createdAt)}</span>
                                <span className="text-[#1A1A1A]">
                                    {t.orderId === "MANUAL_REPAYMENT" ? "💰 Manual Repayment" : `Order #${t.orderId.slice(-6).toUpperCase()}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-medium text-red-600">-{formatCurrency(t.amountDeducted)}</span>
                                <span className="text-[#6B7280]">Balance: {formatCurrency(t.balanceAfter)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
