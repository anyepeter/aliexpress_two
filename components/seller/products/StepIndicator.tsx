"use client";

import { Check } from "lucide-react";

interface Step {
  label: string;
  icon: React.ReactNode;
}

interface StepIndicatorProps {
  steps: Step[];
  current: number; // 0-indexed
  onStepClick?: (step: number) => void;
}

export default function StepIndicator({ steps, current, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const clickable = done && onStepClick; // only allow going back to completed steps

        return (
          <div key={i} className="flex items-center">
            {/* Circle + label */}
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(i)}
              className={`flex flex-col items-center focus:outline-none group ${clickable ? "cursor-pointer" : "cursor-default"}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  done
                    ? "bg-green-500 text-white group-hover:bg-green-600 group-hover:scale-105"
                    : active
                    ? "bg-[#E53935] text-white shadow-lg scale-110"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : step.icon}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium whitespace-nowrap transition-colors ${
                  active ? "text-[#E53935]" : done ? "text-green-500 group-hover:text-green-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </button>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-12 sm:w-20 mx-1 mb-4 transition-colors duration-500 ${
                  i < current ? "bg-green-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
