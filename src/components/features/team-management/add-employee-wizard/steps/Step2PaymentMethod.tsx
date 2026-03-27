"use client";

import React from "react";
import { Bitcoin, Landmark } from "lucide-react";
import { PaymentMethodData, PaymentMethod } from "../types";

interface Props {
  defaultValues: PaymentMethodData;
  onNext: (data: PaymentMethodData) => void;
  onBack: () => void;
}

const OPTIONS: {
  value: PaymentMethod;
  icon: React.ReactNode;
  label: string;
  description: string;
}[] = [
  {
    value: "fiat",
    icon: <Landmark className="h-7 w-7" />,
    label: "Bank Transfer (Fiat)",
    description: "Pay via bank account. Bank details will be collected next.",
  },
  {
    value: "crypto",
    icon: <Bitcoin className="h-7 w-7" />,
    label: "Crypto Wallet",
    description: "Pay in cryptocurrency. Wallet address collected separately.",
  },
];

export function Step2PaymentMethod({ defaultValues, onNext, onBack }: Props) {
  const [selected, setSelected] = React.useState<PaymentMethod>(
    defaultValues.paymentMethod
  );

  const handleContinue = () => {
    onNext({ paymentMethod: selected });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Choose how this employee will be paid. If{" "}
        <span className="font-medium text-gray-700 dark:text-gray-200">
          Fiat
        </span>{" "}
        is selected, you will provide bank details in the next step.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {OPTIONS.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              className={`
                relative flex flex-col items-start gap-3 p-5 rounded-xl border-2 text-left
                transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? "border-primary-500 bg-primary-500/5 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }
              `}
            >
              {/* Selected dot */}
              <span
                className={`
                  absolute top-3 right-3 h-4 w-4 rounded-full border-2 flex items-center justify-center
                  transition-colors duration-200
                  ${isActive ? "border-primary-500 bg-primary-500" : "border-gray-300 bg-white dark:bg-gray-900"}
                `}
              >
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>

              <span
                className={`
                  p-2.5 rounded-lg
                  ${isActive ? "bg-primary-500/10 text-primary-600" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}
                `}
              >
                {opt.icon}
              </span>

              <div>
                <p
                  className={`font-semibold text-sm ${isActive ? "text-primary-600 dark:text-primary-400" : "text-gray-800 dark:text-gray-100"}`}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="px-5 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
