"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Store, Mail, RefreshCw, CheckCircle2 } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

export default function VerifyEmailPage() {
  const { user } = useClerk();
  const [cooldown, setCooldown] = useState(0);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      const emailAddress = user?.emailAddresses?.[0];
      if (emailAddress) {
        await emailAddress.prepareVerification({ strategy: "email_link", redirectUrl: `${window.location.origin}/api/auth/redirect` });
      }
      setResent(true);
      setCooldown(60);
    } catch {
      // silently fail
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Store className="w-7 h-7 text-[#E53935]" />
          <span className="text-xl font-extrabold text-[#E53935]">
            Ali<span className="text-[#E53935]">Express</span>
          </span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          {/* Animated email icon */}
          <div className="relative mx-auto mb-6 w-24 h-24">
            <div className="w-24 h-24 bg-[#E53935]/10 rounded-full flex items-center justify-center animate-pulse">
              <Mail className="w-12 h-12 text-[#E53935]" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">
            Check your inbox
          </h1>
          <p className="text-gray-500 mb-2">
            We&apos;ve sent a verification link to:
          </p>
          <p className="text-[#E53935] font-semibold mb-6">
            {user?.primaryEmailAddress?.emailAddress ?? "your email address"}
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Click the link in the email to verify your account. The link expires
            in 24 hours. Check your spam folder if you don&apos;t see it.
          </p>

          {/* Resent confirmation */}
          {resent && (
            <div className="flex items-center justify-center gap-2 text-green-600 text-sm mb-4">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verification email sent!</span>
            </div>
          )}

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#E53935] text-[#E53935] rounded-lg text-sm font-semibold hover:bg-[#C62828] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
          </button>

          <div className="text-sm text-gray-500">
            <Link
              href="/auth/login"
              className="text-[#E53935] font-medium hover:text-[#E53935] transition-colors"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
