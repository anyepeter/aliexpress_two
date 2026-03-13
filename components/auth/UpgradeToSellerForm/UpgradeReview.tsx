"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SellerStep2Input, SellerStep3Input } from "@/lib/validations/auth";
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

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

type FullUpgradeData = SellerStep2Input & SellerStep3Input & Step4Data;

interface UpgradeReviewProps {
  userData: UserData;
  formData: FullUpgradeData;
  onBack: () => void;
  onEditStep: (step: number) => void;
}

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", CA: "Canada", AU: "Australia",
  DE: "Germany", FR: "France", CN: "China", JP: "Japan", KR: "South Korea",
  IN: "India", BR: "Brazil", MX: "Mexico", SG: "Singapore", AE: "UAE",
  ZA: "South Africa", NG: "Nigeria", EG: "Egypt", TR: "Turkey",
  PK: "Pakistan", BD: "Bangladesh", CM: "Cameroon",
};

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
        {step > 0 && (
          <button
            type="button"
            onClick={() => onEdit(step)}
            className="flex items-center gap-1.5 text-xs text-[#E53935] hover:text-[#E53935] font-medium transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
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

export default function UpgradeReview({
  userData,
  formData,
  onBack,
  onEditStep,
}: UpgradeReviewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/auth/upgrade-role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: formData.storeName,
          description: formData.description,
          businessRegNo: formData.businessRegNo,
          logoUrl: formData.logoUrl,
          bannerUrl: formData.bannerUrl,
          country: formData.country,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          street: formData.street,
          idDocumentUrl: formData.idDocumentUrl,
          taxDocumentUrl: formData.taxDocumentUrl,
        }),
      });

      const data = await res.json() as { success?: boolean; error?: string };

      if (!res.ok) {
        if (data.error === "STORE_NAME_EXISTS") {
          setSubmitError("This store name is already taken. Please go back and choose another.");
        } else {
          setSubmitError(data.error ?? "Upgrade failed. Please try again.");
        }
        return;
      }

      setRedirecting(true);
      router.push("/seller/dashboard");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (redirecting) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#E53935]">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
            <span className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping" />
          </div>
          <Loader2 className="w-6 h-6 text-[#E53935] animate-spin" />
          <div className="text-center">
            <p className="text-white font-semibold text-lg">Setting up your store…</p>
            <p className="text-blue-200 text-sm mt-1">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Review your information before submitting. Your account info is pre-filled from your existing profile.
      </p>

      {/* Your account info (read-only) */}
      <SectionCard
        title="Your Account"
        icon={<User className="w-4 h-4" />}
        step={0}
        onEdit={onEditStep}
      >
        <Row label="Name" value={`${userData.firstName} ${userData.lastName}`} />
        <Row label="Email" value={userData.email} />
        {userData.phone && <Row label="Phone" value={userData.phone} />}
        <p className="text-xs text-[#E53935] mt-1">
          Your personal info is linked to your existing account.
        </p>
      </SectionCard>

      {/* Store Info */}
      <SectionCard
        title="Store Details"
        icon={<Store className="w-4 h-4" />}
        step={1}
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

      {/* Location */}
      <SectionCard
        title="Business Location"
        icon={<MapPin className="w-4 h-4" />}
        step={2}
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

      {/* Documents */}
      <SectionCard
        title="Documents & Agreements"
        icon={<FileCheck className="w-4 h-4" />}
        step={3}
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
          disabled={loading}
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
