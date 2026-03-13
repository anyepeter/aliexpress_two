"use client";

import { useState, useEffect } from "react";
import type { LoanRequest } from "@/lib/types/loans";
import ActiveLoanBanner from "@/components/seller/loans/ActiveLoanBanner";
import LoanStatsRow from "@/components/seller/loans/LoanStatsRow";
import LoanRequestForm from "@/components/seller/loans/LoanRequestForm";
import LoanHistory from "@/components/seller/loans/LoanHistory";
import RepayLoanModal from "@/components/seller/loans/RepayLoanModal";
import { useLoanNotifications } from "@/lib/hooks/useLoanNotifications";
import { Loader2 } from "lucide-react";

export default function SellerLoansClient() {
    const [loans, setLoans] = useState<LoanRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [repayOpen, setRepayOpen] = useState(false);

    const fetchLoans = async () => {
        try {
            const res = await fetch("/api/seller/loans");
            if (res.ok) {
                const data = await res.json();
                setLoans(data);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    useLoanNotifications(() => {
        fetchLoans();
    });

    const activeLoan = loans.find((l) => l.status === "APPROVED") ?? null;
    const pendingLoan = loans.find((l) => l.status === "PENDING") ?? null;

    const handleNewLoan = (loan: LoanRequest) => {
        setLoans((prev) => [loan, ...prev]);
    };

    const handleCancel = (loanId: string) => {
        setLoans((prev) =>
            prev.map((l) => (l.id === loanId ? { ...l, status: "CANCELLED" as const } : l))
        );
    };

    const handleRepay = async (amount: number, paymentMethod: "BANK_TRANSFER" | "BITCOIN") => {
        if (!activeLoan) return;
        const res = await fetch(`/api/seller/loans/${activeLoan.id}/repay`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, paymentMethod }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Repayment failed");
        }
        await fetchLoans();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#E53935] animate-spin" />
            </div>
        );
    }

    return (
        <>
            {/* Active Loan Banner */}
            <ActiveLoanBanner loan={activeLoan} onRepay={() => setRepayOpen(true)} />

            {/* Stats Row */}
            <LoanStatsRow loans={loans} />

            {/* Two column: Form + History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <LoanRequestForm
                    activeLoan={activeLoan}
                    pendingLoan={pendingLoan}
                    onSubmit={handleNewLoan}
                    onCancel={handleCancel}
                />
                <LoanHistory loans={loans} />
            </div>

            {/* Repay Loan Modal */}
            <RepayLoanModal
                isOpen={repayOpen}
                onClose={() => setRepayOpen(false)}
                onConfirm={handleRepay}
                currentBalance={activeLoan?.balanceRemaining ?? 0}
            />
        </>
    );
}
