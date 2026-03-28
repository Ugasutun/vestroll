/**
 * BlockchainError hierarchy for wrapping stellar-sdk and RPC errors
 * into consistent, actionable error types for API consumers.
 */

/**
 * Base class for all blockchain-related errors
 */
export class BlockchainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when the requested account does not exist on the blockchain
 */
export class AccountNotFoundError extends BlockchainError {
  constructor(
    message: string = "Account not found",
    originalError?: Error,
  ) {
    super(message, "account_not_found", originalError);
  }
}

/**
 * Thrown when the account has insufficient funds for the requested operation
 */
export class InsufficientFundsError extends BlockchainError {
  constructor(
    message: string = "Insufficient funds",
    public readonly required?: string,
    public readonly available?: string,
    originalError?: Error,
  ) {
    super(
      required && available
        ? `${message}: required ${required}, available ${available}`
        : message,
      "insufficient_funds",
      originalError,
    );
  }
}

/**
 * Thrown when transaction simulation fails
 */
export class SimulationFailedError extends BlockchainError {
  constructor(
    message: string = "Transaction simulation failed",
    public readonly simulationError?: string,
    originalError?: Error,
  ) {
    super(message, "simulation_failed", originalError);
  }
}

/**
 * Thrown when a transaction is rejected by the network or RPC
 */
export class TransactionRejectedError extends BlockchainError {
  constructor(
    message: string = "Transaction rejected",
    public readonly transactionHash?: string,
    public readonly rejectionReason?: string,
    originalError?: Error,
  ) {
    super(message, "transaction_rejected", originalError);
  }
}

/**
 * Helper to detect and wrap stellar-sdk / RPC errors
 * Inspects error messages and codes to determine the appropriate error type
 */
export function wrapBlockchainError(error: unknown): BlockchainError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const originalError = error instanceof Error ? error : undefined;

  // Check for common error patterns in stellar-sdk/rpc responses
  
  // Account not found patterns
  if (
    errorMessage.toLowerCase().includes("account not found") ||
    errorMessage.toLowerCase().includes("account does not exist") ||
    errorMessage.toLowerCase().includes("invalid account")
  ) {
    return new AccountNotFoundError(
      `Account not found: ${errorMessage}`,
      originalError,
    );
  }

  // Insufficient funds patterns
  if (
    errorMessage.toLowerCase().includes("insufficient") ||
    errorMessage.toLowerCase().includes("not enough") ||
    errorMessage.toLowerCase().includes("balance too low")
  ) {
    return new InsufficientFundsError(
      `Insufficient funds: ${errorMessage}`,
      undefined,
      undefined,
      originalError,
    );
  }

  // Simulation failed patterns
  if (
    errorMessage.toLowerCase().includes("simulation") ||
    errorMessage.toLowerCase().includes("simulate") ||
    errorMessage.toLowerCase().includes("host function error")
  ) {
    return new SimulationFailedError(
      `Simulation failed: ${errorMessage}`,
      errorMessage,
      originalError,
    );
  }

  // Transaction rejected patterns
  if (
    errorMessage.toLowerCase().includes("transaction") &&
    (errorMessage.toLowerCase().includes("rejected") ||
      errorMessage.toLowerCase().includes("failed") ||
      errorMessage.toLowerCase().includes("error"))
  ) {
    return new TransactionRejectedError(
      `Transaction rejected: ${errorMessage}`,
      undefined,
      errorMessage,
      originalError,
    );
  }

  // Default to base BlockchainError
  return new BlockchainError(
    `Blockchain error: ${errorMessage}`,
    "blockchain_error",
    originalError,
  );
}