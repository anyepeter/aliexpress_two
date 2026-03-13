"use client";

import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  stepLabels,
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-0" />
        {/* Progress line */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-[#E53935] transition-all duration-500 -z-0"
          style={{
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
          }}
        />

        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <div
              key={step}
              className="flex flex-col items-center gap-1.5 z-10"
            >
              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-[#E53935] border-[#E53935] text-white"
                    : isCurrent
                    ? "bg-[#E53935] border-[#E53935] text-white ring-4 ring-[#E53935]/20"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-medium hidden md:block text-center max-w-[70px] leading-tight ${
                  isCurrent
                    ? "text-[#E53935]"
                    : isCompleted
                    ? "text-[#E53935]"
                    : "text-gray-400"
                }`}
              >
                {stepLabels[step - 1]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
