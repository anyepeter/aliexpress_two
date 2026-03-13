"use client";

import { useState } from "react";
import type { SellerStep2Input, SellerStep3Input } from "@/lib/validations/auth";
import StepIndicator from "@/components/auth/SellerRegisterForm/StepIndicator";
import Step2StoreInfo from "@/components/auth/SellerRegisterForm/Step2StoreInfo";
import Step3Location from "@/components/auth/SellerRegisterForm/Step3Location";
import Step4Documents from "@/components/auth/SellerRegisterForm/Step4Documents";
import UpgradeReview from "./UpgradeReview";

interface Step4Data {
  idDocumentUrl?: string;
  taxDocumentUrl?: string;
  agreedToTerms: boolean;
  agreedToSellerPolicy: boolean;
}

type FullFormData = Partial<SellerStep2Input> &
  Partial<SellerStep3Input> &
  Partial<Step4Data>;

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

interface UpgradeToSellerFormProps {
  userData: UserData;
}

export default function UpgradeToSellerForm({ userData }: UpgradeToSellerFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FullFormData>({});

  function handleStep1(data: SellerStep2Input) {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  }

  function handleStep2(data: SellerStep3Input) {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(3);
  }

  function handleStep3(data: Step4Data) {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(4);
  }

  function goBack() {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }

  function goToStep(step: number) {
    setCurrentStep(step);
  }

  return (
    <div className="space-y-6">
      <StepIndicator
        currentStep={currentStep}
        totalSteps={4}
        stepLabels={["Store", "Location", "Documents", "Review"]}
      />

      {currentStep === 1 && (
        <Step2StoreInfo
          initialData={formData as Partial<SellerStep2Input>}
          onNext={handleStep1}
          onBack={() => window.history.back()}
        />
      )}

      {currentStep === 2 && (
        <Step3Location
          initialData={formData as Partial<SellerStep3Input>}
          onNext={handleStep2}
          onBack={goBack}
        />
      )}

      {currentStep === 3 && (
        <Step4Documents
          initialData={formData as Partial<Step4Data>}
          onNext={handleStep3}
          onBack={goBack}
        />
      )}

      {currentStep === 4 && (
        <UpgradeReview
          userData={userData}
          formData={
            formData as SellerStep2Input & SellerStep3Input & Step4Data
          }
          onBack={goBack}
          onEditStep={goToStep}
        />
      )}
    </div>
  );
}
