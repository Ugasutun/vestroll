export type PaymentMethod = "crypto" | "fiat";

export interface BasicInfoData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  type: "Freelancer" | "Contractor";
}

export interface PaymentMethodData {
  paymentMethod: PaymentMethod;
}

export interface BankDetailsData {
  bankName: string;
  accountNumber: string;
  accountName: string; // read-only, populated after verification
}

export interface WizardFormData {
  basicInfo: BasicInfoData;
  paymentMethod: PaymentMethodData;
  bankDetails: BankDetailsData;
}

export const WIZARD_STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Payment Method" },
  { id: 3, label: "Payment Details" },
  { id: 4, label: "Review" },
] as const;
