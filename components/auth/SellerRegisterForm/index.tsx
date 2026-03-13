"use client";

import { useState } from "react";
import type {
  SellerStep1Input,
  SellerStep2Input,
  SellerStep3Input,
} from "@/lib/validations/auth";
import StepIndicator from "./StepIndicator";
import Step1BasicInfo from "./Step1BasicInfo";
import Step2StoreInfo from "./Step2StoreInfo";
import Step3Location from "./Step3Location";
import Step4Documents from "./Step4Documents";
import Step5Review from "./Step5Review";

interface Step4Data {
  idDocumentUrl?: string;
  taxDocumentUrl?: string;
  agreedToTerms: boolean;
  agreedToSellerPolicy: boolean;
}

type FullFormData = Partial<SellerStep1Input> &
  Partial<SellerStep2Input> &
  Partial<SellerStep3Input> &
  Partial<Step4Data>;

export default function SellerRegisterForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FullFormData>({});

  function handleStep1(data: SellerStep1Input) {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  }

  function handleStep2(data: SellerStep2Input) {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(3);
  }

  function handleStep3(data: SellerStep3Input) {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(4);
  }

  function handleStep4(data: Step4Data) {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(5);
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
        totalSteps={5}
        stepLabels={["Account", "Store", "Location", "Documents", "Review"]}
      />

      {currentStep === 1 && (
        <Step1BasicInfo
          initialData={formData as Partial<SellerStep1Input>}
          onNext={handleStep1}
        />
      )}

      {currentStep === 2 && (
        <Step2StoreInfo
          initialData={formData as Partial<SellerStep2Input>}
          onNext={handleStep2}
          onBack={goBack}
        />
      )}

      {currentStep === 3 && (
        <Step3Location
          initialData={formData as Partial<SellerStep3Input>}
          onNext={handleStep3}
          onBack={goBack}
        />
      )}

      {currentStep === 4 && (
        <Step4Documents
          initialData={formData as Partial<Step4Data>}
          onNext={handleStep4}
          onBack={goBack}
        />
      )}

      {currentStep === 5 && (
        <Step5Review
          formData={
            formData as SellerStep1Input &
              SellerStep2Input &
              SellerStep3Input &
              Step4Data
          }
          onBack={goBack}
          onEditStep={goToStep}
        />
      )}
    </div>
  );
}
