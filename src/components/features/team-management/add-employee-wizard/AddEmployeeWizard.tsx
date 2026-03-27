"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import Stepper from "@/components/ui/stepper";
import { 
  WizardFormData, 
  WIZARD_STEPS, 
  BasicInfoData, 
  PaymentMethodData, 
  BankDetailsData 
} from "./types";
import { Step1BasicInfo } from "./steps/Step1BasicInfo";
import { Step2PaymentMethod } from "./steps/Step2PaymentMethod";
import { Step3PaymentDetails } from "./steps/Step3PaymentDetails";
import { Step4Review } from "./steps/Step4Review";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface AddEmployeeWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: WizardFormData) => Promise<void>;
}

const INITIAL_DATA: WizardFormData = {
  basicInfo: {
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    department: "",
    type: "Freelancer",
  },
  paymentMethod: {
    paymentMethod: "fiat",
  },
  bankDetails: {
    bankName: "",
    accountNumber: "",
    accountName: "",
  },
};

export function AddEmployeeWizard({ 
  isOpen, 
  onClose, 
  onSuccess 
}: AddEmployeeWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = (stepData: Partial<WizardFormData[keyof WizardFormData]>) => {
    const stepKey = 
      activeStep === 0 ? "basicInfo" : 
      activeStep === 1 ? "paymentMethod" : 
      activeStep === 2 ? "bankDetails" : null;

    if (stepKey) {
      setFormData(prev => ({
        ...prev,
        [stepKey]: { ...prev[stepKey], ...stepData }
      }));
    }

    // Skip bank details if crypto is selected
    if (activeStep === 1 && (stepData as PaymentMethodData).paymentMethod === "crypto") {
      setActiveStep(3); // Go directly to Review
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    // If coming back from Review and crypto was selected, go to Step 2
    if (activeStep === 3 && formData.paymentMethod.paymentMethod === "crypto") {
      setActiveStep(1);
    } else {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSuccess(formData);
      onClose();
      setFormData(INITIAL_DATA);
      setActiveStep(0);
    } catch (error) {
      console.error("Failed to add employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Step1BasicInfo 
            defaultValues={formData.basicInfo} 
            onNext={(data) => handleNext(data)} 
          />
        );
      case 1:
        return (
          <Step2PaymentMethod 
            defaultValues={formData.paymentMethod} 
            onNext={(data) => handleNext(data)} 
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <Step3PaymentDetails 
            defaultValues={formData.bankDetails} 
            onNext={(data) => handleNext(data)} 
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step4Review 
            formData={formData} 
            onSubmit={handleSubmit} 
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden border-none bg-white dark:bg-gray-950 shadow-2xl rounded-2xl">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Add New Employee
                </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400">
                  Follow the steps to onboard a new team member.
                </DialogDescription>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-xs font-medium text-gray-400 mb-2 uppercase tracking-widest">
                <span>Step {activeStep + 1} of {WIZARD_STEPS.length}</span>
                <span>{WIZARD_STEPS[activeStep].label}</span>
              </div>
              <Stepper 
                steps={WIZARD_STEPS.map(s => s.label)} 
                activeStep={activeStep} 
                setActiveStep={(step) => {
                  // Optional: allow jumping back but not forward past visited steps
                  if (step < activeStep) setActiveStep(step);
                }} 
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer - Step 1 has button inside its form for easier submit handling */}
          {activeStep === 0 && (
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <Button 
                type="submit" 
                form="step1-form"
                className="px-8 bg-primary-600 hover:bg-primary-700 text-white font-semibold"
              >
                Next Step
              </Button>
            </div>
          )}
          
          {/* Step 3 footer also handled internally for verification logic */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
