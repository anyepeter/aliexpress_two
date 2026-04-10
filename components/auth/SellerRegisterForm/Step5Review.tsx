"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { SellerStep1Input, SellerStep2Input, SellerStep3Input } from "@/lib/validations/auth";
import {
  User,
  Store,
  MapPin,
  FileCheck,
  Pencil,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Step4Data {
  idDocumentUrl?: string;
  taxDocumentUrl?: string;
  agreedToTerms: boolean;
  agreedToSellerPolicy: boolean;
}

type FullFormData = SellerStep1Input & SellerStep2Input & SellerStep3Input & Step4Data;

interface Step5Props {
  formData: FullFormData;
  onBack: () => void;
  onEditStep: (step: number) => void;
}

import isoCountries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
isoCountries.registerLocale(enLocale);
const COUNTRY_NAMES = isoCountries.getNames("en", { select: "official" });

function SectionCard({
  title, icon, step, onEdit, children,
}: {
  title: string;
  icon: React.ReactNode;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          {icon}
          {title}
        </div>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="flex items-center gap-1.5 text-xs text-[#E53935] hover:text-[#E53935] font-medium transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
      <div className="px-4 py-3 space-y-2 text-sm text-gray-600">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 min-w-[120px] flex-shrink-0">{label}:</span>
      <span className="text-gray-700 break-all">{value}</span>
    </div>
  );
}

export default function Step5Review({ formData, onBack, onEditStep }: Step5Props) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit() {
    if (!isLoaded) return;
    setLoading(true);
    setSubmitError("");

    try {
      // 1. Register in DB + create Clerk user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "SELLER", ...formData }),
      });

      const data = await res.json() as { success?: boolean; error?: string };

      if (!res.ok) {
        setSubmitError(data.error ?? "Registration failed. Please try again.");
        return;
      }

      // 2. Auto sign in with Clerk using the same credentials
      const result = await signIn!.create({
        identifier: formData.email,
        strategy: "password",
        password: formData.password,
      });

      if (result.status === "complete") {
        setRedirecting(true);
        await setActive!({ session: result.createdSessionId });
        router.push("/api/auth/redirect");
        return;
      }

      // Fallback if sign-in isn't immediately complete
      router.push("/auth/login");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { longMessage?: string; message?: string }[] };
      const msg =
        clerkErr?.errors?.[0]?.longMessage ??
        clerkErr?.errors?.[0]?.message ??
        "Something went wrong. Please try again.";
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  }

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
            <p className="text-white font-semibold text-lg tracking-wide">Setting up your store…</p>
            <p className="text-white/50 text-sm mt-1.5">Setting things up for you</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Please review your information before submitting. You can go back to edit any section.
      </p>

      {/* Step 1: Personal Info */}
      <SectionCard
        title="Personal Information"
        icon={<User className="w-4 h-4" />}
        step={1}
        onEdit={onEditStep}
      >
        <Row label="Name" value={`${formData.firstName} ${formData.lastName}`} />
        <Row label="Email" value={formData.email} />
        <Row label="Phone" value={formData.phone} />
      </SectionCard>

      {/* Step 2: Store Info */}
      <SectionCard
        title="Store Details"
        icon={<Store className="w-4 h-4" />}
        step={2}
        onEdit={onEditStep}
      >
        <Row label="Store Name" value={formData.storeName} />
        {formData.businessRegNo && (
          <Row label="Reg. Number" value={formData.businessRegNo} />
        )}
        <Row label="Description" value={formData.description} />
        {formData.logoUrl && (
          <div className="flex gap-2 items-center">
            <span className="text-gray-400 min-w-[120px]">Logo:</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={formData.logoUrl}
              alt="Store logo"
              className="w-10 h-10 rounded-lg object-cover border border-gray-200"
            />
          </div>
        )}
        {formData.bannerUrl && (
          <div className="flex gap-2 items-center">
            <span className="text-gray-400 min-w-[120px]">Banner:</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={formData.bannerUrl}
              alt="Store banner"
              className="w-20 h-10 rounded object-cover border border-gray-200"
            />
          </div>
        )}
      </SectionCard>

      {/* Step 3: Location */}
      <SectionCard
        title="Business Location"
        icon={<MapPin className="w-4 h-4" />}
        step={3}
        onEdit={onEditStep}
      >
        <Row label="Street" value={formData.street} />
        <Row label="City" value={formData.city} />
        <Row label="State" value={formData.state} />
        <Row label="Postal Code" value={formData.postalCode} />
        <Row
          label="Country"
          value={COUNTRY_NAMES[formData.country] ?? formData.country}
        />
      </SectionCard>

      {/* Step 4: Documents */}
      <SectionCard
        title="Documents & Agreements"
        icon={<FileCheck className="w-4 h-4" />}
        step={4}
        onEdit={onEditStep}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2
            className={`w-4 h-4 ${formData.idDocumentUrl ? "text-green-500" : "text-gray-300"}`}
          />
          <span>Government ID {formData.idDocumentUrl ? "uploaded" : "missing"}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2
            className={`w-4 h-4 ${formData.taxDocumentUrl ? "text-green-500" : "text-gray-300"}`}
          />
          <span>
            Tax document{" "}
            {formData.taxDocumentUrl ? "uploaded" : "not provided (optional)"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2
            className={`w-4 h-4 ${formData.agreedToTerms ? "text-green-500" : "text-gray-300"}`}
          />
          <span>Terms of Service agreed</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2
            className={`w-4 h-4 ${formData.agreedToSellerPolicy ? "text-green-500" : "text-gray-300"}`}
          />
          <span>Seller Policy agreed</span>
        </div>
      </SectionCard>

      {/* Error */}
      {submitError && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !isLoaded}
          className="flex-1 py-3 bg-[#E53935] text-white rounded-lg font-bold text-sm hover:bg-[#C62828] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit Application"
          )}
        </button>
      </div>
    </div>
  );
}
