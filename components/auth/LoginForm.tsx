"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Store } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CLERK_ERROR_MAP: Record<string, string> = {
  form_password_incorrect: "Incorrect email or password.",
  form_password_not_correct: "Incorrect email or password.",
  form_identifier_not_found: "No account found with this email.",
  identifier_already_signed_in: "You are already signed in.",
  too_many_requests: "Too many attempts. Please wait a few minutes.",
  form_param_format_invalid: "Please enter a valid email address.",
  session_exists: "A session already exists. Please refresh and try again.",
};

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    if (!isLoaded || !signIn) return;
    setApiError(null);
    console.log("Attempting sign in with:", data);

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });
      console.log("Sign in result:", result);

      if (result.status === "complete") {
        setRedirecting(true);
        await setActive({ session: result.createdSessionId });
        const redirectUrl = redirectTo
          ? `/api/auth/redirect?redirect=${encodeURIComponent(redirectTo)}`
          : "/api/auth/redirect";
        router.push(redirectUrl);
      } else {
        setApiError("Sign in failed. Please try again.");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { code: string; message?: string; longMessage?: string }[] };
      const code = clerkErr?.errors?.[0]?.code ?? "";
      const rawMsg =
        clerkErr?.errors?.[0]?.longMessage ??
        clerkErr?.errors?.[0]?.message ??
        "Sign in failed. Please try again.";
      setApiError(CLERK_ERROR_MAP[code] ?? rawMsg);
    }
  };

  // Full-screen loading overlay shown immediately after successful auth
  if (redirecting) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0F2540] via-[#1a3050] to-[#0a1a2e]">
        <div className="flex flex-col items-center gap-6">
          {/* Logo icon with animated rings */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Store className="w-10 h-10 text-white" />
            </div>
            <span className="absolute inset-0 rounded-2xl border-2 border-white/20 animate-ping" />
            <span className="absolute -inset-2 rounded-3xl border border-white/10 animate-pulse" />
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>

          <div className="text-center">
            <p className="text-white font-semibold text-lg tracking-wide">Preparing your dashboard…</p>
            <p className="text-white/50 text-sm mt-1.5">Setting things up for you</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">Welcome back</h2>
        <p className="text-gray-500 text-sm mt-1">Sign in to your AliExpress account</p>
      </div>

      {apiError && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <button
              type="button"
              className="text-xs text-[#E53935] hover:text-[#A67B1E] font-medium"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="pl-10 pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowPassword((v) => !v);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isLoaded}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#E53935] text-white rounded-lg font-semibold text-sm hover:bg-[#C62828] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        {onSwitchToRegister ? (
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#E53935] font-semibold hover:underline"
          >
            Create Account
          </button>
        ) : (
          <a href={redirectTo ? `/auth/register/buyer?redirect=${encodeURIComponent(redirectTo)}` : "/auth/register"} className="text-[#E53935] font-semibold hover:underline">
            Create Account
          </a>
        )}
      </p>
    </div>
  );
}
