"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/format";
import { Loader2, X, DollarSign, CreditCard, Bitcoin } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, paymentMethod: "BANK_TRANSFER" | "BITCOIN") => Promise<void>;
    currentBalance: number;
}

const QUICK_PERCENTS = [25, 50, 75, 100];

export default function RepayLoanModal({
    isOpen,
    onClose,
    onConfirm,
    currentBalance,
}: Props) {
    const [amount, setAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"BANK_TRANSFER" | "BITCOIN" | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const numAmount = parseFloat(amount) || 0;
    const balanceAfter = Math.max(0, currentBalance - numAmount);
    const isValid = numAmount > 0 && numAmount <= currentBalance && paymentMethod !== null;

    const handleConfirm = async () => {
        if (!isValid || !paymentMethod) return;
        setLoading(true);
        setError(null);
        try {
            await onConfirm(numAmount, paymentMethod);
            setAmount("");
            setPaymentMethod(null);
            onClose();
        } catch {
            setError("Failed to submit repayment request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleQuickPercent = (pct: number) => {
        const val = (currentBalance * pct) / 100;
        setAmount(val.toFixed(2));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 z-10">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-5 h-5 text-[#E53935]" />
                    <h3 className="text-lg font-bold text-[#E53935]">Request Loan Repayment</h3>
                </div>
                <p className="text-sm text-[#6B7280] mb-6">
                    Submit a repayment request for admin approval
                </p>

                {/* Current balance */}
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                    <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Outstanding balance</span>
                        <span className="font-bold text-[#E53935]">{formatCurrency(currentBalance)}</span>
                    </div>
                </div>

                {/* Amount input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                        How much do you want to repay?
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] font-medium">$</span>
                        <input
                            type="number"
                            min="0.01"
                            max={currentBalance}
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={currentBalance.toFixed(2)}
                            className="w-full pl-7 pr-4 py-3 border border-[#E5E7EB] rounded-xl text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                        />
                    </div>
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2 mb-5">
                    {QUICK_PERCENTS.map((pct) => (
                        <button
                            key={pct}
                            type="button"
                            onClick={() => handleQuickPercent(pct)}
                            className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${numAmount === (currentBalance * pct) / 100
                                    ? "bg-[#E53935] text-white border-[#E53935]"
                                    : "bg-white text-[#E53935] border-[#E5E7EB] hover:border-[#E53935]"
                                }`}
                        >
                            {pct === 100 ? "Full" : `${pct}%`}
                        </button>
                    ))}
                </div>

                {/* Payment Method */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                        Payment Method
                    </label>
                    <div className="space-y-2">
                        <label
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                paymentMethod === "BANK_TRANSFER"
                                    ? "border-[#E53935] bg-[#E53935]/5"
                                    : "border-[#E5E7EB] hover:border-[#E53935]/30"
                            }`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                checked={paymentMethod === "BANK_TRANSFER"}
                                onChange={() => setPaymentMethod("BANK_TRANSFER")}
                                className="accent-[#E53935]"
                            />
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                <CreditCard className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-[#1A1A1A]">Bank Transfer</span>
                        </label>

                        <label
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                paymentMethod === "BITCOIN"
                                    ? "border-[#E53935] bg-[#E53935]/5"
                                    : "border-[#E5E7EB] hover:border-[#E53935]/30"
                            }`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                checked={paymentMethod === "BITCOIN"}
                                onChange={() => setPaymentMethod("BITCOIN")}
                                className="accent-[#E53935]"
                            />
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                <Bitcoin className="w-4 h-4 text-orange-600" />
                            </div>
                            <span className="text-sm font-medium text-[#1A1A1A]">Bitcoin</span>
                        </label>
                    </div>
                </div>

                {/* Balance preview */}
                {numAmount > 0 && numAmount <= currentBalance && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-blue-700">Repayment amount</span>
                            <span className="font-medium text-blue-800">{formatCurrency(numAmount)}</span>
                        </div>
                        <div className="border-t border-blue-200 pt-2 flex justify-between text-sm">
                            <span className="font-semibold text-blue-800">Balance after approval</span>
                            <span className="font-bold text-blue-700">
                                {balanceAfter === 0 ? "Fully Repaid ✓" : formatCurrency(balanceAfter)}
                            </span>
                        </div>
                    </div>
                )}

                {numAmount > currentBalance && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                        <p className="text-xs text-red-600">Amount exceeds outstanding balance</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                        <p className="text-xs text-red-600">{error}</p>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3 border border-[#E5E7EB] text-[#1A1A1A] font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading || !isValid}
                        className="flex-1 py-3 bg-[#E53935] text-white font-semibold rounded-xl hover:bg-[#C62828] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                        ) : (
                            `Submit Request`
                        )}
                    </button>
                </div>

                <p className="text-[11px] text-center text-[#6B7280] mt-4">
                    Admin will review and approve your repayment
                </p>
            </div>
        </div>
    );
}
