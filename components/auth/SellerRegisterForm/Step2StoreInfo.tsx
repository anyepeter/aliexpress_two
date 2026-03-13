"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sellerStep2Schema, type SellerStep2Input } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CloudinaryUpload from "../CloudinaryUpload";
import { Store, FileText, Loader2 } from "lucide-react";

interface Step2Props {
  initialData: Partial<SellerStep2Input>;
  onNext: (data: SellerStep2Input) => void;
  onBack: () => void;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function Step2StoreInfo({ initialData, onNext, onBack }: Step2Props) {
  const [storeNameDuplicate, setStoreNameDuplicate] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SellerStep2Input>({
    resolver: zodResolver(sellerStep2Schema),
    defaultValues: initialData,
  });

  const storeNameValue = watch("storeName") ?? "";
  const descriptionValue = watch("description") ?? "";
  const storeSlug = slugify(storeNameValue);

  useEffect(() => {
    if (!storeNameValue || storeNameValue.length < 3) {
      setStoreNameDuplicate(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/check-duplicate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeName: storeNameValue }),
        });
        const data = await res.json() as { storeNameExists: boolean };
        setStoreNameDuplicate(data.storeNameExists);
      } catch {
        // ignore
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [storeNameValue]);

  // Blocking check on Continue — runs even if debounce hasn't fired yet
  async function handleFormSubmit(data: SellerStep2Input) {
    if (data.storeName && data.storeName.length >= 3) {
      setIsChecking(true);
      try {
        const res = await fetch("/api/auth/check-duplicate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeName: data.storeName }),
        });
        const result = await res.json() as { storeNameExists: boolean };
        if (result.storeNameExists) {
          setStoreNameDuplicate(true);
          return;
        }
      } catch {
        // If check fails, let the register API catch it later
      } finally {
        setIsChecking(false);
      }
    }
    setStoreNameDuplicate(false);
    onNext(data);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Store Name */}
      <div className="space-y-1.5">
        <Label htmlFor="s2-storeName">
          Store Name <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            id="s2-storeName"
            placeholder="My Awesome Store"
            className="pl-10"
            autoComplete="off"
            {...register("storeName")}
          />
        </div>
        {storeSlug && !storeNameDuplicate && (
          <p className="text-xs text-gray-500">
            Your store URL:{" "}
            <span className="font-medium text-[#E53935]">
              markethub.com/store/{storeSlug}
            </span>
          </p>
        )}
        {storeNameDuplicate && (
          <p className="text-red-500 text-xs">
            This store name is already taken. Please choose another.
          </p>
        )}
        {errors.storeName && (
          <p className="text-red-500 text-xs">{errors.storeName.message}</p>
        )}
      </div>

      {/* Business Registration Number */}
      <div className="space-y-1.5">
        <Label htmlFor="s2-businessRegNo">
          Business Registration Number{" "}
          <span className="text-gray-400 text-xs">(optional)</span>
        </Label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            id="s2-businessRegNo"
            placeholder="e.g. 12345678"
            className="pl-10"
            {...register("businessRegNo")}
          />
        </div>
      </div>

      {/* Store Description */}
      <div className="space-y-1.5">
        <Label htmlFor="s2-description">
          Store Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="s2-description"
          placeholder="Tell customers what makes your store unique… (min 20 characters)"
          rows={4}
          className="resize-none"
          {...register("description")}
        />
        <div className="flex justify-between items-center">
          {errors.description ? (
            <p className="text-red-500 text-xs">{errors.description.message}</p>
          ) : (
            <span />
          )}
          <span
            className={`text-xs tabular-nums ${
              descriptionValue.length < 20 ? "text-gray-400" : "text-green-600"
            }`}
          >
            {descriptionValue.length}/500
          </span>
        </div>
      </div>

      {/* Store Logo */}
      <div className="space-y-1.5">
        <Label>
          Store Logo{" "}
          <span className="text-gray-400 text-xs">(optional)</span>
        </Label>
        <CloudinaryUpload
          folder="store-logos"
          accept="image/*"
          maxSizeMB={2}
          aspectRatio="1:1"
          label="Upload store logo (square, 1:1 ratio)"
          currentUrl={initialData.logoUrl}
          onUploadComplete={(url) => setValue("logoUrl", url)}
          onUploadError={(err) => console.error("Logo upload error:", err)}
        />
      </div>

      {/* Store Banner */}
      <div className="space-y-1.5">
        <Label>
          Store Banner{" "}
          <span className="text-gray-400 text-xs">(optional)</span>
        </Label>
        <CloudinaryUpload
          folder="store-banners"
          accept="image/*"
          maxSizeMB={5}
          aspectRatio="16:9"
          label="Upload store banner (16:9 ratio)"
          currentUrl={initialData.bannerUrl}
          onUploadComplete={(url) => setValue("bannerUrl", url)}
          onUploadError={(err) => console.error("Banner upload error:", err)}
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={storeNameDuplicate || isChecking}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#E53935] text-white rounded-lg font-semibold text-sm hover:bg-[#C62828] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </form>
  );
}
