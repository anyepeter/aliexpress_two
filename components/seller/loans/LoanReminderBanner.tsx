"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, Ban } from "lucide-react";

interface ActiveLoan {
  id: string;
  approvedAmount: number;
  balanceRemaining: number;
  dailyInterestRate: number;
  accumulatedInterest: number;
  daysRemaining: number | null;
  isOverdue: boolean;
  dueDate: string | null;
}

export default function LoanReminderBanner() {
  const [loan, setLoan] = useState<ActiveLoan | null>(null);
  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    fetch("/api/seller/loans")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.loans) return;
        const active = data.loans.find((l: ActiveLoan & { status: string }) => l.status === "APPROVED");
        if (active) setLoan(active);
      })
      .catch(() => {});

    // Check if seller is suspended
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.status === "SUSPENDED") setIsSuspended(true);
      })
      .catch(() => {});
  }, []);

  // Suspended store warning (overdue loan)
  if (isSuspended && loan?.isOverdue) {
    const totalOwed = loan.balanceRemaining + loan.accumulatedInterest;
    return (
      <Link href="/seller/loans">
        <div className="rounded-2xl p-5 mb-6 border-2 border-red-300 bg-red-50 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <Ban className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-base font-bold text-red-800">
                Store Suspended — Overdue Loan
              </p>
              <p className="text-sm text-red-700 mt-1">
                Your store has been suspended because your loan is overdue. Your products are hidden from the marketplace until you repay.
              </p>
              <div className="mt-3 bg-white/60 rounded-xl p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Balance</span>
                  <span className="font-bold text-gray-900">${loan.balanceRemaining.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Accumulated interest</span>
                  <span className="font-bold text-amber-700">${loan.accumulatedInterest.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-1">
                  <span className="font-bold text-gray-900">Total to repay</span>
                  <span className="font-black text-red-700">${totalOwed.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-red-600 font-semibold mt-3">
                Click here to repay now and reactivate your store →
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (!loan) return null;

  const totalOwed = loan.balanceRemaining + loan.accumulatedInterest;
  const isUrgent = loan.isOverdue || (loan.daysRemaining !== null && loan.daysRemaining <= 2);

  return (
    <Link href="/seller/loans">
      <div className={`rounded-2xl p-4 mb-6 border cursor-pointer hover:shadow-md transition-shadow ${
        loan.isOverdue ? "bg-red-50 border-red-200" : isUrgent ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"
      }`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {loan.isOverdue ? (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            ) : (
              <Clock className="w-5 h-5 text-blue-600 shrink-0" />
            )}
            <div>
              <p className={`text-sm font-bold ${loan.isOverdue ? "text-red-800" : "text-gray-900"}`}>
                {loan.isOverdue ? "Loan Overdue!" : "Loan Repayment Reminder"}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Balance: ${loan.balanceRemaining.toLocaleString()} + Interest: ${loan.accumulatedInterest.toFixed(2)} = <strong>${totalOwed.toFixed(2)}</strong> total
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-2xl font-black ${loan.isOverdue ? "text-red-600" : isUrgent ? "text-amber-600" : "text-blue-700"}`}>
              {loan.daysRemaining ?? 0}
            </div>
            <p className="text-[10px] text-gray-500">days left</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
