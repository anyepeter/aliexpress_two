"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tag, ShoppingBag, Percent, Rocket } from "lucide-react";
import type { DummyProduct, SellerProductForm, SavedSellerProduct } from "@/lib/types/sellerProduct";
import StepIndicator from "./StepIndicator";
import Step1Categories from "./steps/Step1Categories";
import Step2SelectProducts from "./steps/Step2SelectProducts";
import Step3SetMargins from "./steps/Step3SetMargins";
import Step4PublishArrange from "./steps/Step4PublishArrange";

const STEPS = [
  { label: "Categories", icon: <Tag className="w-4 h-4" /> },
  { label: "Products", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "Margins", icon: <Percent className="w-4 h-4" /> },
  { label: "Publish", icon: <Rocket className="w-4 h-4" /> },
];

export default function MyProductsWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Step data
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<DummyProduct[]>([]);
  const [productForms, setProductForms] = useState<Map<number, SellerProductForm>>(new Map());
  const [savedProducts, setSavedProducts] = useState<SavedSellerProduct[]>([]);

  // Existing products in this store (not selectable again)
  const [existingProductIds, setExistingProductIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/seller/products")
      .then((r) => r.json())
      .then((data) => {
        const ids = new Set<number>(
          (data.products ?? []).map((p: { dummyProductId: number }) => p.dummyProductId)
        );
        setExistingProductIds(ids);
      })
      .catch(() => {});
  }, []);

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToStep = useCallback((n: number) => {
    setAnimating(true);
    setTimeout(() => {
      setStep(n);
      setAnimating(false);
    }, 200);
  }, []);

  // Step 1 → 2
  const handleStep1Next = (cats: string[]) => {
    setCategories(cats);
    goToStep(1);
  };

  // Step 2 → 3
  const handleStep2Next = (products: DummyProduct[], ids: number[]) => {
    setSelectedProducts(products);
    setSelectedIds(ids);
    goToStep(2);
  };

  // Step 3 → 4: save to DB then move
  const handleStep3Next = async (forms: SellerProductForm[]) => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: forms }),
      });
      if (!res.ok) throw new Error("Failed to save products");
      const data = await res.json();
      setSavedProducts(data.products);
      // Update form map
      const map = new Map<number, SellerProductForm>();
      for (const f of forms) map.set(f.dummyProductId, f);
      setProductForms(map);
      goToStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  // Step 4: publish
  const handlePublish = async (order: string[], enabledIds: Set<string>) => {
    setIsPublishing(true);
    setError(null);
    try {
      const productIds = Array.from(enabledIds);
      const res = await fetch("/api/seller/products/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds, order }),
      });
      if (!res.ok) throw new Error("Failed to publish products");
      router.refresh();
      router.push("/seller/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="px-6 pt-5 pb-6">
      {/* Step indicator — completed steps are clickable to go back */}
      <StepIndicator steps={STEPS} current={step} onStepClick={goToStep} />

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Step content — no inner card, already inside the page card */}
      <div
        className={`transition-all duration-150 ${
          animating ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
        }`}
      >
        {step === 0 && (
          <Step1Categories selected={categories} onNext={handleStep1Next} />
        )}
        {step === 1 && (
          <Step2SelectProducts
            categories={categories}
            selected={selectedIds}
            existingProductIds={existingProductIds}
            onNext={handleStep2Next}
            onBack={() => goToStep(0)}
          />
        )}
        {step === 2 && (
          <Step3SetMargins
            products={selectedProducts}
            savedForms={productForms}
            onNext={handleStep3Next}
            onBack={() => goToStep(1)}
            isSaving={isSaving}
          />
        )}
        {step === 3 && (
          <Step4PublishArrange
            products={selectedProducts}
            saved={savedProducts}
            onPublish={handlePublish}
            onBack={() => goToStep(2)}
            isPublishing={isPublishing}
          />
        )}
      </div>
    </div>
  );
}
