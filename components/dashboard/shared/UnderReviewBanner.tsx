"use client";

import { Clock, Mail, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnderReviewBannerProps {
  status: string;
  role?: "SELLER" | "BUYER" | "ADMIN";
}

export default function UnderReviewBanner({ status, role }: UnderReviewBannerProps) {
  if (status === "ACTIVE") return null;

  if (status === "PENDING_APPROVAL") {
    return (
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6">
        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-800 text-sm">Account Under Review</p>
          <p className="text-amber-700 text-sm mt-0.5">
            Your seller account is being reviewed by our team. This typically takes 2–3 business
            days. You&apos;ll receive an email once approved. Meanwhile, you can explore your
            dashboard and set up your store profile.
          </p>
        </div>
      </div>
    );
  }

  if (status === "PENDING_VERIFICATION") {
    return (
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6">
        <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-800 text-sm">Verify Your Email</p>
          <p className="text-blue-700 text-sm mt-0.5">
            Please check your inbox and click the verification link we sent to activate your
            account.{" "}
            <Button
              variant="link"
              className="text-blue-700 p-0 h-auto text-sm font-medium underline"
            >
              Resend email
            </Button>
          </p>
        </div>
      </div>
    );
  }

  if (status === "SUSPENDED") {
    return (
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
        <Ban className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-800 text-sm">Account Suspended</p>
          <p className="text-red-700 text-sm mt-0.5">
            Your account has been suspended. Please contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  // REJECTED
  if (status === "REJECTED" && role === "SELLER") {
    return (
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
        <Ban className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-800 text-sm">Application Rejected</p>
          <p className="text-red-700 text-sm mt-0.5">
            Your seller application was not approved. Please contact support if you think this is
            a mistake.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
