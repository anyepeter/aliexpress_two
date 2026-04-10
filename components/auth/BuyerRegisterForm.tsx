"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Phone, User, Store } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { buyerRegisterSchema, type BuyerRegisterInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import PasswordStrength from "./PasswordStrength";

export default function BuyerRegisterForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BuyerRegisterInput>({
    resolver: zodResolver(buyerRegisterSchema),
    defaultValues: { agreeToTerms: false },
  });

  const password = watch("password") ?? "";
  const agreeToTerms = watch("agreeToTerms");

  const onSubmit = async (data: BuyerRegisterInput) => {
    setApiError(null);
    try {
      // 1. Register in DB + create Clerk user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role: "BUYER" }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Registration failed");

      // 2. Auto sign in with Clerk
      if (!signIn || !isLoaded) {
        router.push("/auth/login");
        return;
      }
      const result = await signIn.create({
        identifier: data.email,
        strategy: "password",
        password: data.password,
      });

      if (result.status === "complete") {
        setRedirecting(true);
        await setActive({ session: result.createdSessionId });
        const redirectUrl = redirectTo
          ? `/api/auth/redirect?redirect=${encodeURIComponent(redirectTo)}`
          : "/api/auth/redirect";
        router.push(redirectUrl);
      } else {
        // Fallback — should not normally happen
        router.push("/auth/login");
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  // Full-screen loading overlay after successful registration
  if (redirecting) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0F2540] via-[#1a3050] to-[#0a1a2e]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Store className="w-10 h-10 text-white" />
            </div>
            <span className="absolute inset-0 rounded-2xl border-2 border-white/20 animate-ping" />
            <span className="absolute -inset-2 rounded-3xl border border-white/10 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-lg tracking-wide">Setting up your account…</p>
            <p className="text-white/50 text-sm mt-1.5">Setting things up for you</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          ⚠ {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">
              First Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input id="firstName" placeholder="Jane" className="pl-9" {...register("firstName")} />
            </div>
            {errors.firstName && (
              <p className="text-red-500 text-xs">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input id="lastName" placeholder="Doe" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-red-500 text-xs">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input id="email" type="email" placeholder="you@example.com" className="pl-10" {...register("email")} />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input id="phone" type="tel" placeholder="+1 555 000 0000" className="pl-10" {...register("phone")} />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrength password={password} />
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">
            Confirm Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <Checkbox
            id="agreeToTerms"
            checked={agreeToTerms}
            onCheckedChange={(v) => setValue("agreeToTerms", v === true)}
            className="mt-0.5"
          />
          <Label htmlFor="agreeToTerms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
            I agree to the{" "}
            <Link href="#" className="text-[#E53935] font-medium hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-[#E53935] font-medium hover:underline">
              Privacy Policy
            </Link>
            <span className="text-red-500"> *</span>
          </Label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-red-500 text-xs">{errors.agreeToTerms.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#E53935] text-white rounded-lg font-semibold text-sm hover:bg-[#C62828] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </div>
  );
}
