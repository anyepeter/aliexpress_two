"use client";

import { useState, useRef } from "react";
import { Eye, EyeOff, Mail, Phone, User, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sellerStep1Schema, type SellerStep1Input } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordStrength from "../PasswordStrength";

interface Step1Props {
  initialData: Partial<SellerStep1Input>;
  onNext: (data: SellerStep1Input) => void;
}

export default function Step1BasicInfo({ initialData, onNext }: Step1Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SellerStep1Input>({
    resolver: zodResolver(sellerStep1Schema),
    defaultValues: initialData,
  });

  const password = watch("password") ?? "";
  const emailValue = watch("email") ?? "";

  // Live debounced check for instant feedback as the user types
  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setEmailTaken(false);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/check-duplicate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value }),
        });
        const data = await res.json() as { emailExists: boolean };
        setEmailTaken(data.emailExists);
      } catch {
        // ignore network errors on the live check
      }
    }, 500);
  }

  // Blocking check on Continue — runs even if debounce hasn't fired yet
  async function handleFormSubmit(data: SellerStep1Input) {
    setIsChecking(true);
    try {
      const res = await fetch("/api/auth/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const result = await res.json() as { emailExists: boolean };

      if (result.emailExists) {
        setEmailTaken(true);
        return; // block proceeding
      }
    } catch {
      // If the duplicate check fails, let the register API catch it later
    } finally {
      setIsChecking(false);
    }

    setEmailTaken(false);
    onNext(data);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="s1-firstName">
            First Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              id="s1-firstName"
              placeholder="Jane"
              className="pl-9"
              autoComplete="given-name"
              {...register("firstName")}
            />
          </div>
          {errors.firstName && (
            <p className="text-red-500 text-xs">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s1-lastName">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="s1-lastName"
            placeholder="Doe"
            autoComplete="family-name"
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="s1-email">
          Email <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            id="s1-email"
            type="email"
            placeholder="you@business.com"
            className={`pl-10 ${emailTaken ? "border-red-400 focus-visible:ring-red-400" : ""}`}
            autoComplete="email"
            {...register("email", {
              onChange: handleEmailChange,
            })}
          />
        </div>
        {emailTaken && (
          <p className="text-red-500 text-xs font-medium">
            An account with this email already exists. Please use a different email or{" "}
            <a href="/auth/login" className="underline hover:text-red-700">
              sign in
            </a>
            .
          </p>
        )}
        {!emailTaken && errors.email && (
          <p className="text-red-500 text-xs">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <Label htmlFor="s1-phone">
          Phone <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            id="s1-phone"
            type="tel"
            placeholder="+1 555 000 0000"
            className="pl-10"
            autoComplete="tel"
            {...register("phone")}
          />
        </div>
        {errors.phone && (
          <p className="text-red-500 text-xs">{errors.phone.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="s1-password">
          Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="s1-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pr-10"
            autoComplete="new-password"
            {...register("password")}
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setShowPassword((v) => !v);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <PasswordStrength password={password} />
        {errors.password && (
          <p className="text-red-500 text-xs">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <Label htmlFor="s1-confirm">
          Confirm Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="s1-confirm"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            className="pr-10"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setShowConfirm((v) => !v);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={emailTaken || isChecking}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#E53935] text-white rounded-lg font-semibold text-sm hover:bg-[#C62828] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isChecking ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Checking…
          </>
        ) : (
          "Continue →"
        )}
      </button>
    </form>
  );
}
