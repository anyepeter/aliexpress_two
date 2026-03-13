"use client";

import { useState } from "react";
import type { LoanRequest } from "@/lib/types/loans";
import { formatCurrency } from "@/lib/utils/format";
import { Loader2, AlertTriangle } from "lucide-react";

interface Props {
    activeLoan: LoanRequest | null;
    pendingLoan: LoanRequest | null;
    onSubmit: (loan: LoanRequest) => void;
    onCancel: (loanId: string) => void;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function LoanRequestForm({ activeLoan, pendingLoan, onSubmit, onCancel }: Props) {
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const numAmount = parseFloat(amount) || 0;
    const hasActive = activeLoan !== null;
    const hasPending = pendingLoan !== null;
    const isDisabled = hasActive || hasPending;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isDisabled || loading) return;
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/seller/loans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: numAmount, reason: reason.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to submit loan request");
                return;
            }
            setAmount("");
            setReason("");
            onSubmit(data);
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!pendingLoan || cancelling) return;
        setCancelling(true);
        try {
            const res = await fetch(`/api/seller/loans/${pendingLoan.id}`, { method: "DELETE" });
            if (res.ok) {
                onCancel(pendingLoan.id);
            }
        } catch {
            // silent
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-[#E53935] px-6 py-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    📋 Request a Business Loan
                </h3>
            </div>

            <div className="p-6">
                {/* Active loan notice */}
                {hasActive && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                        <p className="text-sm text-green-800 font-medium">
                            ✅ You have an active loan with {formatCurrency(activeLoan.balanceRemaining)} remaining.
                        </p>
                        <p className="text-xs text-green-600 mt-1">Repay your current loan before requesting another.</p>
                    </div>
                )}

                {/* Pending loan notice */}
                {hasPending && !hasActive && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                        <p className="text-sm text-amber-800 font-medium">
                            ⏳ You have a pending loan request of {formatCurrency(pendingLoan.amount)}.
                        </p>
                        <p className="text-xs text-amber-600 mt-1">Wait for admin review or cancel your existing request.</p>
                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="mt-3 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            Cancel Pending Request
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Amount */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                            How much do you need?
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] font-medium">$</span>
                            <input
                                type="number"
                                min="100"
                                max="10000"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={isDisabled}
                                placeholder="1500.00"
                                className="w-full pl-7 pr-4 py-3 border border-[#E5E7EB] rounded-xl text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935] disabled:bg-gray-50 disabled:text-gray-400"
                            />
                        </div>
                        <p className="text-xs text-[#6B7280] mt-1.5">Min: $100 · Max: $10,000</p>
                    </div>

                    {/* Quick amounts */}
                    <div className="flex flex-wrap gap-2 mb-5">
                        {QUICK_AMOUNTS.map((qa) => (
                            <button
                                key={qa}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => setAmount(String(qa))}
                                className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${numAmount === qa
                                        ? "bg-[#E53935] text-white border-[#E53935]"
                                        : "bg-white text-[#E53935] border-[#E5E7EB] hover:border-[#E53935] disabled:opacity-50"
                                    }`}
                            >
                                ${qa.toLocaleString()}
                            </button>
                        ))}
                    </div>

                    {/* Reason */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                            What&apos;s this loan for?
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={isDisabled}
                            minLength={20}
                            maxLength={500}
                            rows={4}
                            placeholder="I need to fund pending orders that came in this week..."
                            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl text-[#1A1A1A] resize-none focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935] disabled:bg-gray-50 disabled:text-gray-400"
                        />
                        <p className={`text-xs mt-1 ${reason.length < 20 ? "text-[#6B7280]" : "text-[#16A34A]"}`}>
                            {reason.length}/500 characters (min 20)
                        </p>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700">
                            Loan repayment is automatically deducted from your orders when you choose &quot;Pay with Loan&quot;
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isDisabled || loading || numAmount < 100 || reason.trim().length < 20}
                        className="w-full py-3.5 bg-[#E53935] text-white font-semibold rounded-xl hover:bg-[#b5842a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                            </>
                        ) : (
                            `Request ${numAmount > 0 ? formatCurrency(numAmount) : ""} Loan`
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
