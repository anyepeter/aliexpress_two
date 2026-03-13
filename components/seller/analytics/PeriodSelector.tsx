"use client";

import type { AnalyticsPeriod } from "@/lib/types/analytics";

interface Props {
    value: AnalyticsPeriod;
    onChange: (period: AnalyticsPeriod) => void;
}

const PERIODS: { label: string; value: AnalyticsPeriod }[] = [
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
    { label: "90D", value: "90d" },
    { label: "All", value: "all" },
];

export default function PeriodSelector({ value, onChange }: Props) {
    return (
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {PERIODS.map((p) => (
                <button
                    key={p.value}
                    onClick={() => onChange(p.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${value === p.value
                            ? "bg-[#E53935] text-white"
                            : "text-[#6B7280] hover:text-[#E53935]"
                        }`}
                >
                    {p.label}
                </button>
            ))}
        </div>
    );
}
