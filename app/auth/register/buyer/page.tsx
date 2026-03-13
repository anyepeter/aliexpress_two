import Link from "next/link";
import { Store, ArrowLeft, ShoppingBag, Shield, Zap } from "lucide-react";
import BuyerRegisterForm from "@/components/auth/BuyerRegisterForm";

export const metadata = {
  title: "Create Buyer Account — MarketHub",
};

const BENEFITS = [
  {
    icon: ShoppingBag,
    title: "Millions of Products",
    desc: "Shop from verified sellers worldwide",
  },
  {
    icon: Shield,
    title: "Buyer Protection",
    desc: "100% money-back guarantee on all orders",
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    desc: "Express shipping to 190+ countries",
  },
];

interface PageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function BuyerRegisterPage({ searchParams }: PageProps) {
  const { redirect: redirectTo } = await searchParams;
  return (
    <div className="h-screen overflow-hidden flex bg-[#F5F6FA]">
      {/* ── Left decorative panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 bg-gradient-to-br from-[#E53935] via-[#0F2540] to-[#0a1a2e] flex-col justify-between p-10 relative overflow-hidden flex-shrink-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-36 -right-24 w-[480px] h-[480px] rounded-full bg-[#E53935]/10" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <Store className="w-9 h-9 text-[#E53935]" />
          <span className="text-2xl font-extrabold text-white tracking-tight">
            Market<span className="text-[#E53935]">Hub</span>
          </span>
        </Link>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-3">
              Start shopping today
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed">
              Create your free account and access millions of products from verified
              sellers around the world.
            </p>
          </div>

          <div className="space-y-5">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#E53935]/20 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#E53935]" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-blue-200 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300/60 text-xs relative z-10">
          © {new Date().getFullYear()} MarketHub. All rights reserved.
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Minimal top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <Store className="w-6 h-6 text-[#E53935]" />
            <span className="text-lg font-extrabold text-[#E53935]">
              Market<span className="text-[#E53935]">Hub</span>
            </span>
          </Link>
          <div className="hidden lg:block" />
          <Link
            href="/auth/register"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#E53935] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-lg mx-auto w-full px-6 py-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Create your account</h1>
              <p className="text-sm text-gray-500 mt-1">
                Start shopping millions of products from verified sellers
              </p>
            </div>

            <BuyerRegisterForm />

            <p className="mt-6 text-center text-xs text-gray-400">
              Already have an account?{" "}
              <Link
                href={redirectTo ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}` : "/auth/login"}
                className="text-[#E53935] font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
