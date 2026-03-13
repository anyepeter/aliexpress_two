"use client";

interface PasswordStrengthProps {
  password: string;
}

const checks = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  {
    label: "Special character",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColors = [
  "bg-gray-200",
  "bg-red-500",
  "bg-orange-400",
  "bg-yellow-400",
  "bg-green-500",
];

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const score = checks.filter((c) => c.test(password)).length;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= score ? strengthColors[score] : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <span
          className={`text-xs font-medium w-12 text-right ${
            score === 1
              ? "text-red-500"
              : score === 2
              ? "text-orange-400"
              : score === 3
              ? "text-yellow-500"
              : score === 4
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          {strengthLabels[score]}
        </span>
      </div>

      {/* Requirement checklist */}
      <ul className="space-y-0.5">
        {checks.map((check) => {
          const passed = check.test(password);
          return (
            <li key={check.label} className="flex items-center gap-1.5">
              <span
                className={`text-xs font-bold ${
                  passed ? "text-green-600" : "text-gray-400"
                }`}
              >
                {passed ? "✓" : "✗"}
              </span>
              <span
                className={`text-xs ${
                  passed ? "text-green-700" : "text-gray-500"
                }`}
              >
                {check.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
