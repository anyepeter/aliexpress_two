"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";

export default function TopBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-[#1A1A1A] text-white relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center">
        <p className="text-center text-xs sm:text-sm leading-snug">
          <span className="hidden sm:inline mr-2">🚚</span>
          <span className="font-semibold">Free Shipping</span> on Orders Over
          $50
          <span className="mx-2 text-white/40 hidden sm:inline">|</span>
          <span className="hidden sm:inline">
            New Sellers Welcome —{" "}
            <Link
              href="/auth/register"
              className="underline underline-offset-2 hover:text-[#E53935] transition-colors font-semibold"
            >
              Join Today →
            </Link>
          </span>
        </p>

        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/15 rounded-full transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
