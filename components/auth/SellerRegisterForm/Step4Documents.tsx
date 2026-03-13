"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import CloudinaryUpload from "../CloudinaryUpload";
import { ShieldCheck, Lock } from "lucide-react";

interface Step4Data {
  idDocumentUrl?: string;
  taxDocumentUrl?: string;
  agreedToTerms: boolean;
  agreedToSellerPolicy: boolean;
}

interface Step4Props {
  initialData: Partial<Step4Data>;
  onNext: (data: Step4Data) => void;
  onBack: () => void;
}

export default function Step4Documents({ initialData, onNext, onBack }: Step4Props) {
  const [idDocumentUrl, setIdDocumentUrl] = useState(initialData.idDocumentUrl ?? "");
  const [taxDocumentUrl, setTaxDocumentUrl] = useState(initialData.taxDocumentUrl ?? "");
  const [agreedToTerms, setAgreedToTerms] = useState(initialData.agreedToTerms ?? false);
  const [agreedToSellerPolicy, setAgreedToSellerPolicy] = useState(
    initialData.agreedToSellerPolicy ?? false
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!idDocumentUrl) newErrors.idDoc = "Government-issued ID is required";
    if (!agreedToTerms) newErrors.terms = "You must agree to the Terms of Service";
    if (!agreedToSellerPolicy)
      newErrors.policy = "You must agree to the Seller Policy";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onNext({ idDocumentUrl, taxDocumentUrl, agreedToTerms, agreedToSellerPolicy });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Security note */}
      <div className="flex items-start gap-3 bg-[#E53935]/5 border border-[#E53935]/20 rounded-lg p-4">
        <Lock className="w-5 h-5 text-[#E53935] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600">
          <p className="font-semibold text-[#E53935] mb-1">Secure Document Upload</p>
          <p>
            All documents are encrypted in transit and at rest. They are only
            used for identity verification and are never shared with third parties.
          </p>
        </div>
      </div>

      {/* Government ID */}
      <div className="space-y-1.5">
        <Label>
          Government-Issued ID <span className="text-red-500">*</span>
        </Label>
        <p className="text-xs text-gray-500">
          Upload a clear photo of your passport, driver&apos;s license, or national ID
          card. Accepted: JPG, PNG, PDF (max 10 MB)
        </p>
        <CloudinaryUpload
          folder="seller-documents/id"
          accept="image/*,application/pdf"
          maxSizeMB={10}
          label="Upload ID document"
          currentUrl={idDocumentUrl}
          onUploadComplete={(url) => {
            setIdDocumentUrl(url);
            setErrors((prev) => ({ ...prev, idDoc: "" }));
          }}
          onUploadError={(err) => console.error(err)}
        />
        {errors.idDoc && (
          <p className="text-red-500 text-xs">{errors.idDoc}</p>
        )}
      </div>

      {/* Tax Document */}
      <div className="space-y-1.5">
        <Label>
          Tax Registration Document{" "}
          <span className="text-gray-400 text-xs">(optional)</span>
        </Label>
        <p className="text-xs text-gray-500">
          Business tax ID, EIN, or VAT registration certificate. Required for
          businesses selling over $600/year in the US.
        </p>
        <CloudinaryUpload
          folder="seller-documents/tax"
          accept="image/*,application/pdf"
          maxSizeMB={10}
          label="Upload tax document"
          currentUrl={taxDocumentUrl}
          onUploadComplete={(url) => setTaxDocumentUrl(url)}
          onUploadError={(err) => console.error(err)}
        />
      </div>

      {/* Agreements */}
      <div className="space-y-3 pt-2">
        <div className="space-y-1">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => {
                setAgreedToTerms(checked === true);
                if (checked) setErrors((prev) => ({ ...prev, terms: "" }));
              }}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
              I agree to MarketHub&apos;s{" "}
              <a
                href="/terms"
                target="_blank"
                className="text-[#E53935] underline hover:text-[#E53935]"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target="_blank"
                className="text-[#E53935] underline hover:text-[#E53935]"
              >
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.terms && (
            <p className="text-red-500 text-xs ml-6">{errors.terms}</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-start gap-3">
            <Checkbox
              id="sellerPolicy"
              checked={agreedToSellerPolicy}
              onCheckedChange={(checked) => {
                setAgreedToSellerPolicy(checked === true);
                if (checked) setErrors((prev) => ({ ...prev, policy: "" }));
              }}
              className="mt-0.5"
            />
            <label htmlFor="sellerPolicy" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
              I agree to the{" "}
              <a
                href="/seller-policy"
                target="_blank"
                className="text-[#E53935] underline hover:text-[#E53935]"
              >
                Seller Policy
              </a>
              , including product listing rules, commission structure, and
              dispute resolution procedures.
            </label>
          </div>
          {errors.policy && (
            <p className="text-red-500 text-xs ml-6">{errors.policy}</p>
          )}
        </div>
      </div>

      {/* Verification badge */}
      <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
        <span>
          Your application will be reviewed within <strong>2–3 business days</strong>.
          You&apos;ll receive an email once approved.
        </span>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 bg-[#E53935] text-white rounded-lg font-semibold text-sm hover:bg-[#C62828] transition-colors"
        >
          Review Application →
        </button>
      </div>
    </form>
  );
}
