import Link from "next/link";
import { Megaphone, Calendar, ArrowRight, Clock } from "lucide-react";

interface Props {
  planName: string;
  tier: string;
  price: number;
  durationDays: number;
  startDate: string | null;
  endDate: string | null;
}

function getDaysLeft(endDate: string | null): number {
  if (!endDate) return 0;
  const ms = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function getProgress(startDate: string | null, endDate: string | null): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const total = end - start;
  const elapsed = now - start;
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export default function ActiveAdPlanBanner({
  planName,
  price,
  durationDays,
  startDate,
  endDate,
}: Props) {
  const daysLeft = getDaysLeft(endDate);
  const progress = getProgress(startDate, endDate);
  const isExpiringSoon = daysLeft <= 7;

  return (
    <div className="mb-4 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row">
        {/* Left accent */}
        <div className="sm:w-1.5 h-1.5 sm:h-auto bg-gradient-to-b from-[#0a1a2e] to-[#14304d]" />

        <div className="flex-1 p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0a1a2e] to-[#14304d] flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-gray-900">
                    Advertisement Plan: {planName}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  ${price.toLocaleString()} · {durationDays} days
                </p>
              </div>
            </div>

            <Link
              href="/seller/advertisements"
              className="text-xs font-semibold text-[#0F2540] hover:text-[#14304d] flex items-center gap-1"
            >
              View Details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Days left + progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                {isExpiringSoon ? (
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                )}
                <span className={isExpiringSoon ? "font-semibold text-amber-700" : ""}>
                  {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                  {isExpiringSoon && " — expires soon"}
                </span>
              </div>
              {startDate && endDate && (
                <span className="text-[11px] text-gray-400">
                  {new Date(startDate).toLocaleDateString()} —{" "}
                  {new Date(endDate).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isExpiringSoon
                    ? "bg-gradient-to-r from-amber-400 to-red-500"
                    : "bg-gradient-to-r from-[#0a1a2e] to-[#14304d]"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
