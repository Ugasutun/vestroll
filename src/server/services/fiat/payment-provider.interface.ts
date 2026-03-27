export interface DisburseRequest {
  amount: number;
  reference: string;
  narration: string;
  destinationBankCode: string;
  destinationAccountNumber: string;
  destinationAccountName: string;
  currency: "NGN";
}

export interface DisburseResult {
  reference: string;
  providerReference: string;
  status: "pending" | "completed" | "failed";
  amount: number;
  fee: number;
}

export interface VirtualAccountRequest {
  reference: string;
  accountName: string;
  customerEmail: string;
  customerName: string;
  currency: "NGN";
}

export interface VirtualAccountResult {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  reference: string;
}

export interface PaymentProvider {
  /**
   * Send money to a bank account.
   */
  disburse(request: DisburseRequest): Promise<DisburseResult>;

  /**
   * Create a reserved virtual account for receiving payments.
   */
  generateVirtualAccount(
    request: VirtualAccountRequest
  ): Promise<VirtualAccountResult>;
}
