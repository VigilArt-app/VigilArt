"use client";

type DmcaStepIndicatorProps = {
  currentStep: 1 | 2 | 3;
};

export function DmcaStepIndicator({ currentStep }: DmcaStepIndicatorProps) {
  return (
    <div className="flex gap-4 justify-center">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all border-2 ${
            currentStep === step
              ? "border-blue-400 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-lg scale-110"
              : step < currentStep
              ? "border-green-400 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
              : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500"
          }`}
        >
          {step < currentStep ? "✓" : step}
        </div>
      ))}
    </div>
  );
}
