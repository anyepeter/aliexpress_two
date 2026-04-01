import { Store, ShoppingBag, Shield, Zap } from "lucide-react";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

const BENEFITS = [
  {
    icon: <ShoppingBag className="w-5 h-5" />,
    title: "Millions of Products",
    desc: "Shop from verified sellers worldwide",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Buyer Protection",
    desc: "100% money-back guarantee on all orders",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Fast Delivery",
    desc: "Express shipping to 190+ countries",
  },
];

export const metadata = {
  title: "Sign In — AliExpress",
};

interface PageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { redirect: redirectTo } = await searchParams;
  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (decorative) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#E53935] via-[#0F2540] to-[#0a1a2e] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-[#E53935]/10 rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-white/3 rounded-full" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <Store className="w-9 h-9 text-[#E53935]" />
          <span className="text-2xl font-extrabold text-white tracking-tight">
            Ali<span className="text-[#E53935]">Express</span>
          </span>
        </Link>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-3">
              Welcome back to the marketplace
            </h2>
            <p className="text-blue-200 text-lg">
              Sign in to track your orders, manage your wishlist, and discover personalized deals.
            </p>
          </div>

          <div className="space-y-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#E53935]/20 rounded-xl flex items-center justify-center text-[#E53935] flex-shrink-0">
                  {b.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{b.title}</p>
                  <p className="text-blue-200 text-xs">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-blue-300 text-xs relative z-10">
          © {new Date().getFullYear()} AliExpress. All rights reserved.
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F5F6FA]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <Store className="w-7 h-7 text-[#E53935]" />
            <span className="text-xl font-extrabold text-[#E53935]">
              Ali<span className="text-[#E53935]">Express</span>
            </span>
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">Sign in</h1>
              <p className="text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link
                  href={redirectTo ? `/auth/register/buyer?redirect=${encodeURIComponent(redirectTo)}` : "/auth/register"}
                  className="text-[#E53935] font-semibold hover:text-[#E53935] transition-colors"
                >
                  Create one free
                </Link>
              </p>
            </div>

            <LoginForm />

            <p className="mt-4 text-center text-xs text-gray-400">
              By signing in you agree to our{" "}
              <a href="/terms" className="underline hover:text-gray-600">
                Terms
              </a>{" "}
              &amp;{" "}
              <a href="/privacy" className="underline hover:text-gray-600">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
