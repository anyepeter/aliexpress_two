"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "login";
  const isLogin = tab !== "register";

  const switchTab = useCallback(
    (next: "login" | "register") => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", next);
      router.replace(`/auth?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-md">
      {/* Tab bar */}
      <div className="p-1 bg-gray-100 m-4 mb-0 rounded-xl grid grid-cols-2">
        <button
          type="button"
          onClick={() => switchTab("login")}
          className={`py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            isLogin
              ? "bg-white text-[#E53935] shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchTab("register")}
          className={`py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            !isLogin
              ? "bg-white text-[#E53935] shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Form content */}
      <div className="p-6 pt-5">
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => switchTab("register")} />
        ) : (
          <RegisterForm onSwitchToLogin={() => switchTab("login")} />
        )}
      </div>
    </div>
  );
}
