"use client";

import type { LoanRequest } from "@/lib/types/loans";
import { formatCurrency } from "@/lib/utils/format";
import { CreditCard, CheckCircle2, Wallet, FileText } from "lucide-react";

interface Props {
    loans: LoanRequest[];
}

export default function LoanStatsRow({ loans }: Props) {
    const totalBorrowed = loans
        .filter((l) => l.status === "APPROVED" || l.status === "REPAID")
        .reduce((sum, l) => sum + (l.approvedAmount ?? 0), 0);

    const totalRepaid = loans.reduce((sum, l) => sum + l.totalRepaid, 0);

    const activeLoan = loans.find((l) => l.status === "APPROVED");
    const activeBalance = activeLoan?.balanceRemaining ?? 0;

    const repaidCount = loans.filter((l) => l.status === "REPAID").length;
    const activeCount = loans.filter((l) => l.status === "APPROVED").length;

    const stats = [
        {
            label: "Total Borrowed",
            value: formatCurrency(totalBorrowed),
            sub: "All time",
            icon: CreditCard,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            label: "Total Repaid",
            value: formatCurrency(totalRepaid),
            sub: "All time",
            icon: CheckCircle2,
            iconBg: "bg-green-50",
            iconColor: "text-green-600",
        },
        {
            label: "Active Balance",
            value: formatCurrency(activeBalance),
            sub: activeBalance > 0 ? "Available now" : "No active loan",
            icon: Wallet,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
        },
        {
            label: "Loan History",
            value: `${loans.length} loan${loans.length !== 1 ? "s" : ""}`,
            sub: `${repaidCount} repaid${activeCount > 0 ? `, ${activeCount} active` : ""}`,
            icon: FileText,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-[#6B7280]">{stat.label}</span>
                        <div className={`p-2 rounded-xl ${stat.iconBg}`}>
                            <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[#1A1A1A]">{stat.value}</p>
                    <p className="text-xs text-[#6B7280] mt-1">{stat.sub}</p>
                </div>
            ))}
        </div>
    );
}
