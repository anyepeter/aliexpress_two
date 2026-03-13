"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/format";
import { Loader2, X } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    orderNumber: string;
    baseCost: number;
    currentBalance: number;
}

export default function PayWithLoanModal({
    isOpen,
    onClose,
    onConfirm,
    orderNumber,
    baseCost,
    currentBalance,
}: Props) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const balanceAfter = currentBalance - baseCost;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch {
            // error handled in parent
        } finally {
            setLoading(false);
        }
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

                <h3 className="text-lg font-bold text-[#E53935] mb-2">Confirm Loan Payment</h3>
                <p className="text-sm text-[#6B7280] mb-6">
                    Deduct {formatCurrency(baseCost)} from your loan balance for order #{orderNumber}?
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Current balance</span>
                        <span className="font-medium text-[#1A1A1A]">{formatCurrency(currentBalance)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Deduction</span>
                        <span className="font-medium text-red-600">-{formatCurrency(baseCost)}</span>
                    </div>
                    <div className="border-t border-[#E5E7EB] pt-2 flex justify-between text-sm">
                        <span className="text-[#1A1A1A] font-semibold">After payment</span>
                        <span className="font-bold text-[#16A34A]">{formatCurrency(balanceAfter)}</span>
                    </div>
                </div>

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
                        disabled={loading}
                        className="flex-1 py-3 bg-[#16A34A] text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                            </>
                        ) : (
                            "Confirm & Fund Order"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
