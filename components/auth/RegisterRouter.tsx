"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Store, Check } from "lucide-react";

export default function RegisterRouter() {
  const router = useRouter();

  return (
    <div className="w-full max-w-lg space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Join AliExpress</h1>
        <p className="text-gray-500 mt-2">Choose how you&apos;d like to join</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Buyer Card */}
        <div
          onClick={() => router.push("/auth/register/buyer/policy")}
          className="relative bg-white rounded-2xl border-2 border-gray-200 hover:border-[#E53935] p-6 cursor-pointer transition-all duration-200 hover:shadow-lg group"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#E53935]/10 flex items-center justify-center group-hover:bg-[#C62828]/20 transition-colors">
              <ShoppingBag className="w-7 h-7 text-[#E53935]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                Shop as a Buyer
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Browse thousands of products from verified sellers
              </p>
            </div>
            <ul className="w-full space-y-1.5 text-left">
              {[
                "Free to register",
                "Secure checkout",
                "Buyer protection",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-xs text-gray-600"
                >
                  <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push("/auth/register/buyer/policy");
              }}
              className="w-full py-2 border-2 border-[#E53935] text-[#E53935] rounded-lg text-sm font-semibold hover:bg-[#C62828] hover:text-white transition-colors"
            >
              Register as Buyer
            </button>
          </div>
        </div>

        {/* Seller Card */}
        <div
          onClick={() => router.push("/auth/register/seller")}
          className="relative bg-white rounded-2xl border-2 border-[#E53935] hover:border-[#A67B1E] p-6 cursor-pointer transition-all duration-200 hover:shadow-lg group"
        >
          {/* Most Popular badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E53935] text-white text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
            Most Popular
          </div>

          <div className="flex flex-col items-center text-center gap-3 mt-1">
            <div className="w-14 h-14 rounded-2xl bg-[#E53935]/10 flex items-center justify-center group-hover:bg-[#C62828]/20 transition-colors">
              <Store className="w-7 h-7 text-[#E53935]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                Sell on AliExpress
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Set up your store and start selling today
              </p>
            </div>
            <ul className="w-full space-y-1.5 text-left">
              {[
                "Set your own margins",
                "Full store control",
                "Direct messaging",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-xs text-gray-600"
                >
                  <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push("/auth/register/seller");
              }}
              className="w-full py-2 bg-[#E53935] text-white rounded-lg text-sm font-semibold hover:bg-[#C62828] transition-colors"
            >
              Start Selling
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-[#E53935] font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
