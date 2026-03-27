"use client";

import React from "react";
import { 
  User, 
  Mail, 
  Briefcase, 
  Building2, 
  Users, 
  Landmark, 
  Bitcoin,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { WizardFormData } from "../types";
import { Badge } from "@/components/ui/badge";

interface Props {
  formData: WizardFormData;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export function Step4Review({ formData, onSubmit, onBack, isSubmitting = false }: Props) {
  const { basicInfo, paymentMethod, bankDetails } = formData;

  return (
    <div className="space-y-8">
      <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900 rounded-xl p-4 flex gap-3">
        <CheckCircle2 className="h-5 w-5 text-primary-600 shrink-0" />
        <p className="text-sm text-primary-800 dark:text-primary-300">
          Please review the employee information below. Once confirmed, an onboarding invitation will be sent.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
        {/* Basic Info Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <User className="h-4 w-4 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-xs">
              Basic Information
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Full Name</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{basicInfo.firstName} {basicInfo.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{basicInfo.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{basicInfo.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Department</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{basicInfo.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <Badge variant="outline" className="font-normal rounded-full">
                {basicInfo.type}
              </Badge>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <Landmark className="h-4 w-4 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-xs">
              Payment Details
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Method</span>
              <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                {paymentMethod.paymentMethod === "fiat" ? (
                  <>
                    <Landmark className="h-4 w-4 text-primary-600" />
                    <span>Bank Transfer (Fiat)</span>
                  </>
                ) : (
                  <>
                    <Bitcoin className="h-4 w-4 text-orange-500" />
                    <span>Crypto Wallet</span>
                  </>
                )}
              </div>
            </div>

            {paymentMethod.paymentMethod === "fiat" && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bank Name</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{bankDetails.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Number</span>
                  <span className="font-medium font-mono text-gray-900 dark:text-gray-100">{bankDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Name</span>
                  <span className="font-medium text-primary-700 dark:text-primary-400">{bankDetails.accountName}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
        >
          ← Back to details
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all
            bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Confirm & Add Employee
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}
