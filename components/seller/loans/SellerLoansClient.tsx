"use client";

import { useState, useEffect } from "react";
import type { LoanRequest } from "@/lib/types/loans";
import ActiveLoanBanner from "@/components/seller/loans/ActiveLoanBanner";
import LoanStatsRow from "@/components/seller/loans/LoanStatsRow";
import LoanRequestForm from "@/components/seller/loans/LoanRequestForm";
import LoanHistory from "@/components/seller/loans/LoanHistory";
import RepayLoanModal from "@/components/seller/loans/RepayLoanModal";
import { useLoanNotifications } from "@/lib/hooks/useLoanNotifications";
import { Loader2, AlertTriangle, DollarSign, ShoppingBag } from "lucide-react";

interface LoanWithInterest extends LoanRequest {
  accumulatedInterest: number;
  daysRemaining: number | null;
  isOverdue: boolean;
}

interface Eligibility {
  isEligible: boolean;
  totalRevenue: number;
  completedOrders: number;
  minRevenue: number;
  minCompletedOrders: number;
}

interface LoanSettingsData {
  dailyInterestRate: number;
  maxRepaymentDays: number;
  minLoanAmount: number;
  maxLoanAmount: number;
}

export default function SellerLoansClient() {
  const [loans, setLoans] = useState<LoanWithInterest[]>([]);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [settings, setSettings] = useState<LoanSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [repayOpen, setRepayOpen] = useState(false);

  const fetchLoans = async () => {
    try {
      const res = await fetch("/api/seller/loans");
      if (res.ok) {
        const data = await res.json();
        setLoans(data.loans ?? data);
        if (data.eligibility) setEligibility(data.eligibility);
        if (data.settings) setSettings(data.settings);
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
    setLoans((prev) => [{ ...loan, accumulatedInterest: 0, daysRemaining: null, isOverdue: false } as LoanWithInterest, ...prev]);
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
      {/* Eligibility Warning */}
      {eligibility && !eligibility.isEligible && !activeLoan && !pendingLoan && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-800">Not Yet Eligible for Loans</h3>
              <p className="text-xs text-amber-700 mt-1">You must meet both conditions to request a loan:</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className={`w-4 h-4 ${eligibility.totalRevenue >= eligibility.minRevenue ? "text-green-600" : "text-amber-600"}`} />
                  <span className="text-sm text-gray-700">
                    Revenue: <strong>${eligibility.totalRevenue.toLocaleString()}</strong> / ${eligibility.minRevenue.toLocaleString()} required
                  </span>
                  {eligibility.totalRevenue >= eligibility.minRevenue && <span className="text-green-600 text-xs font-bold">✓</span>}
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className={`w-4 h-4 ${eligibility.completedOrders >= eligibility.minCompletedOrders ? "text-green-600" : "text-amber-600"}`} />
                  <span className="text-sm text-gray-700">
                    Completed orders: <strong>{eligibility.completedOrders}</strong> / {eligibility.minCompletedOrders} required
                  </span>
                  {eligibility.completedOrders >= eligibility.minCompletedOrders && <span className="text-green-600 text-xs font-bold">✓</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loan Reminder Banner for Active Loan */}
      {activeLoan && (
        <div className={`rounded-2xl p-5 mb-6 border ${activeLoan.isOverdue ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className={`text-sm font-bold ${activeLoan.isOverdue ? "text-red-800" : "text-blue-800"}`}>
                {activeLoan.isOverdue ? "⚠️ Loan Overdue!" : "📋 Active Loan Reminder"}
              </h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-700">
                  Principal: <strong>${(activeLoan.approvedAmount ?? activeLoan.amount).toLocaleString()}</strong>
                </p>
                <p className="text-sm text-gray-700">
                  Balance remaining: <strong>${activeLoan.balanceRemaining.toLocaleString()}</strong>
                </p>
                <p className="text-sm text-amber-700">
                  Accumulated interest: <strong>${activeLoan.accumulatedInterest.toFixed(2)}</strong>
                  <span className="text-xs text-gray-500 ml-1">({(activeLoan.dailyInterestRate * 100).toFixed(1)}% daily)</span>
                </p>
                <p className="text-sm font-bold text-gray-900">
                  Total owed: <strong>${(activeLoan.balanceRemaining + activeLoan.accumulatedInterest).toFixed(2)}</strong>
                </p>
              </div>
            </div>
            <div className="text-right">
              {activeLoan.daysRemaining !== null && (
                <div className={`text-3xl font-black ${activeLoan.isOverdue ? "text-red-600" : activeLoan.daysRemaining <= 2 ? "text-amber-600" : "text-blue-700"}`}>
                  {activeLoan.daysRemaining}
                </div>
              )}
              <p className="text-xs text-gray-500">days remaining</p>
              {activeLoan.dueDate && (
                <p className="text-[10px] text-gray-400 mt-1">
                  Due: {new Date(activeLoan.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
              <button
                onClick={() => setRepayOpen(true)}
                className="mt-2 px-4 py-1.5 bg-[#E53935] text-white text-xs font-semibold rounded-lg hover:bg-[#C62828] transition-colors"
              >
                Repay Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <LoanStatsRow loans={loans} />

      {/* Two column: Form + History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <LoanRequestForm
          activeLoan={activeLoan}
          pendingLoan={pendingLoan}
          onSubmit={handleNewLoan}
          onCancel={handleCancel}
          isEligible={eligibility?.isEligible ?? true}
          maxRepaymentDays={settings?.maxRepaymentDays ?? 7}
          dailyInterestRate={settings?.dailyInterestRate ?? 0.003}
          minAmount={settings?.minLoanAmount ?? 100}
          maxAmount={settings?.maxLoanAmount ?? 10000}
        />
        <LoanHistory loans={loans} />
      </div>

      {/* Repay Loan Modal */}
      <RepayLoanModal
        isOpen={repayOpen}
        onClose={() => setRepayOpen(false)}
        onConfirm={handleRepay}
        currentBalance={activeLoan ? activeLoan.balanceRemaining + activeLoan.accumulatedInterest : 0}
      />
    </>
  );
}
