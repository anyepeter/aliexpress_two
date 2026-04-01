import Link from "next/link";
import { Store, ArrowLeft, ArrowRight, Check } from "lucide-react";

export const metadata = {
  title: "Buyer Policy — MarketHub Express",
  description:
    "Important purchasing policy information for MarketHub Express buyers. Minimum 10 items per order.",
};

interface PageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function BuyerPolicyPage({ searchParams }: PageProps) {
  const { redirect: redirectTo } = await searchParams;
  const registerUrl = redirectTo
    ? `/auth/register/buyer?redirect=${encodeURIComponent(redirectTo)}`
    : "/auth/register/buyer";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <Store className="w-6 h-6 text-[#E53935]" />
          <span className="text-lg font-extrabold text-[#1A1A1A]">
            Market<span className="text-[#E53935]">Hub</span>
          </span>
        </Link>
        <Link
          href="/auth/register"
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Before you get started
            </p>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
              Purchasing Policy
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              MarketHub Express uses a bulk-purchase model. Please review the
              policy below before creating your account.
            </p>
          </div>

          {/* Policy highlight */}
          <div className="border border-gray-200 rounded-xl p-5 mb-6">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#1A1A1A]">
                Minimum Order Requirement
              </h2>
              <span className="text-xs text-gray-400">Policy</span>
            </div>

            <p className="text-[32px] font-bold text-[#1A1A1A] leading-none mb-1">
              10 items
            </p>
            <p className="text-sm text-gray-500 mb-5">
              per order, minimum
            </p>

            <div className="h-px bg-gray-100 mb-5" />

            <ul className="space-y-3">
              {[
                "You must have at least 10 items in your cart to checkout.",
                "Items can be from any seller or category.",
                "This applies to every order on the platform.",
                "There is no maximum — add as many items as you need.",
              ].map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-600">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Why section */}
          <div className="bg-gray-50 rounded-xl p-5 mb-8">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">
              Why this policy?
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              The 10-item minimum enables cost-effective shipping, better
              wholesale pricing, and a sustainable model for our verified
              sellers. This is how we keep prices significantly lower than
              traditional retail.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href={registerUrl}
              className="w-full py-3 bg-[#E53935] text-white text-sm font-semibold rounded-xl hover:bg-[#C62828] transition-colors flex items-center justify-center gap-2"
            >
              I understand, continue
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/register"
              className="w-full py-3 border border-gray-200 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors text-center block"
            >
              Go back
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing, you agree to the{" "}
            <Link
              href="/terms"
              className="text-gray-500 underline hover:text-gray-700"
            >
              Terms of Service
            </Link>{" "}
            including the minimum purchase policy.
          </p>
        </div>
      </main>
    </div>
  );
}
