"use client";

import { useState, useEffect, useRef } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Store,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Validation schema ────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    firstName: z.string().min(2, "Min 2 characters"),
    lastName: z.string().min(2, "Min 2 characters"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, "Min 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string(),
    storeName: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterInput = z.infer<typeof registerSchema>;

// ─── Password strength bar ────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const textColors = ["", "text-red-500", "text-orange-400", "text-yellow-500", "text-green-600"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[score] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      {score > 0 && (
        <p className={`text-xs font-medium ${textColors[score]}`}>{labels[score]}</p>
      )}
    </div>
  );
}

// ─── Slug helper ──────────────────────────────────────────────────────────────
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── Main component ───────────────────────────────────────────────────────────
interface RegisterFormProps {
  defaultRole?: "BUYER" | "SELLER";
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({
  defaultRole = "SELLER",
  onSwitchToLogin,
}: RegisterFormProps) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [role, setRole] = useState<"BUYER" | "SELLER">(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Store name duplicate check
  const [storeNameStatus, setStoreNameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "", storeName: "" },
  });

  const passwordValue = watch("password") ?? "";
  const storeNameValue = watch("storeName") ?? "";
  const storeSlug = slugify(storeNameValue);

  // Debounced store name check
  useEffect(() => {
    if (role !== "SELLER") return;
    if (!storeNameValue || storeNameValue.length < 3) {
      setStoreNameStatus("idle");
      return;
    }
    setStoreNameStatus("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/check-duplicate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeName: storeNameValue }),
        });
        const data = await res.json() as { storeNameExists: boolean };
        setStoreNameStatus(data.storeNameExists ? "taken" : "available");
      } catch {
        setStoreNameStatus("idle");
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [storeNameValue, role]);

  const onSubmit = async (data: RegisterInput) => {
    if (!isLoaded || !signIn) return;
    setApiError(null);

    if (role === "SELLER" && !data.storeName?.trim()) {
      setError("storeName", { message: "Store name is required" });
      return;
    }

    try {
      // 1. Register in DB + Clerk
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phone: data.phone || undefined,
          role,
          storeName: role === "SELLER" ? data.storeName : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json() as { error: string };
        if (err.error === "EMAIL_EXISTS") {
          setError("email", { message: "This email is already registered." });
          return;
        }
        if (err.error === "STORE_NAME_EXISTS") {
          setError("storeName", { message: "Store name already taken." });
          return;
        }
        setApiError(err.error || "Registration failed. Please try again.");
        return;
      }

      // 2. Auto sign-in via Clerk
      const result = await signIn.create({
        identifier: data.email,
        strategy: "password",
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push(role === "SELLER" ? "/seller/dashboard" : "/buyer/dashboard");
      }
    } catch {
      setApiError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">Create your account</h2>
        <p className="text-gray-500 text-sm mt-1">Join thousands of buyers and sellers</p>
      </div>

      {/* Role toggle */}
      <div className="grid grid-cols-2 gap-3">
        {/* Buyer */}
        <button
          type="button"
          onClick={() => setRole("BUYER")}
          className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
            role === "BUYER"
              ? "border-[#E53935] bg-blue-50 ring-2 ring-[#E53935]/20"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <ShoppingCart
            className={`w-5 h-5 ${role === "BUYER" ? "text-[#E53935]" : "text-gray-400"}`}
          />
          <span
            className={`text-xs font-semibold ${
              role === "BUYER" ? "text-[#E53935]" : "text-gray-600"
            }`}
          >
            I want to shop
          </span>
        </button>

        {/* Seller */}
        <button
          type="button"
          onClick={() => setRole("SELLER")}
          className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
            role === "SELLER"
              ? "border-[#E53935] bg-amber-50 ring-2 ring-[#E53935]/20"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          {role === "SELLER" && (
            <span className="absolute -top-2 -right-2 bg-[#E53935] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
              Popular
            </span>
          )}
          <Store
            className={`w-5 h-5 ${role === "SELLER" ? "text-[#E53935]" : "text-gray-400"}`}
          />
          <span
            className={`text-xs font-semibold ${
              role === "SELLER" ? "text-[#E53935]" : "text-gray-600"
            }`}
          >
            I want to sell
          </span>
        </button>
      </div>

      {apiError && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="reg-firstName">First name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="reg-firstName"
                placeholder="John"
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
            <Label htmlFor="reg-lastName">Last name</Label>
            <Input
              id="reg-lastName"
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
          <Label htmlFor="reg-email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              id="reg-email"
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

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-phone">
            Phone{" "}
            <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 555 000 0000"
              className="pl-10"
              {...register("phone")}
            />
          </div>
        </div>

        {/* Store name — seller only */}
        {role === "SELLER" && (
          <div className="space-y-1.5">
            <Label htmlFor="reg-storeName">
              Store name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="reg-storeName"
                placeholder="e.g. TechWorld Store"
                className="pl-10 pr-8"
                autoComplete="off"
                {...register("storeName")}
              />
              {storeNameValue.length >= 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {storeNameStatus === "checking" && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                  {storeNameStatus === "available" && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  {storeNameStatus === "taken" && (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {storeSlug && storeNameStatus !== "taken" && (
              <p className="text-xs text-gray-400">
                Store URL:{" "}
                <span className="text-[#E53935] font-medium">
                  aliexpress.com/store/{storeSlug}
                </span>
              </p>
            )}
            {storeNameStatus === "taken" && (
              <p className="text-red-500 text-xs">This store name is already taken.</p>
            )}
            {errors.storeName && (
              <p className="text-red-500 text-xs">{errors.storeName.message}</p>
            )}
          </div>
        )}

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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
          <PasswordStrength password={passwordValue} />
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-confirmPassword">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              id="reg-confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className="pl-10 pr-10"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowConfirm((v) => !v);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600"
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
          disabled={isSubmitting || !isLoaded || storeNameStatus === "taken"}
          className={`w-full flex items-center justify-center gap-2 py-2.5 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
            role === "SELLER"
              ? "bg-[#E53935] hover:bg-[#A67B1E]"
              : "bg-[#E53935] hover:bg-[#C62828]"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account…
            </>
          ) : role === "SELLER" ? (
            "Start Selling on AliExpress"
          ) : (
            "Create Buyer Account"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        {onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#E53935] font-semibold hover:underline"
          >
            Sign In
          </button>
        ) : (
          <a href="/auth/login" className="text-[#E53935] font-semibold hover:underline">
            Sign In
          </a>
        )}
      </p>
    </div>
  );
}
