"use client";

import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

type DmcaStepIndicatorProps = {
  currentStep: 1 | 2 | 3;
};

export function DmcaStepIndicator({ currentStep }: DmcaStepIndicatorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-4 justify-center">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all border-2 ${
            currentStep === step
              ? "border-primary bg-primary/10 dark:bg-primary/15 text-primary shadow-lg scale-110"
              : step < currentStep
              ? "border-success bg-card text-success"
              : "border-input bg-card text-muted-foreground"
          }`}
        >
          {step < currentStep ? (
            <>
              <Check className="size-5" aria-hidden="true" />
              <span className="sr-only">{t("dmca_page.step_completed", { step })}</span>
            </>
          ) : (
            step
          )}
        </div>
      ))}
    </div>
  );
}
