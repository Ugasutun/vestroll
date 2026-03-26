import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MonnifyProvider } from "./monnify.provider";

// Mock global fetch
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("MonnifyProvider", () => {
  let provider: MonnifyProvider;

  beforeEach(() => {
    provider = new MonnifyProvider({
      apiKey: "test-api-key",
      secretKey: "test-secret-key",
      baseUrl: "https://sandbox.monnify.com",
      contractCode: "TEST_CONTRACT",
    });
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("authenticate", () => {
    it("fetches a JWT token using base64-encoded credentials", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          requestSuccessful: true,
          responseBody: {
            accessToken: "mock-jwt-token",
            expiresIn: 3600,
          },
        }),
      });

      // Trigger auth by calling disburse (which authenticates first)
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          requestSuccessful: true,
          responseBody: {
            amount: 50000,
            reference: "ref-001",
            transactionReference: "MNFY_TXN_001",
            status: "SUCCESS",
            totalFee: 50,
          },
        }),
      });

      await provider.disburse({
        amount: 50000,
        reference: "ref-001",
        narration: "Test payout",
        destinationBankCode: "058",
        destinationAccountNumber: "0123456789",
        destinationAccountName: "John Doe",
        currency: "NGN",
      });

      // First call should be auth
      const authCall = fetchMock.mock.calls[0];
      expect(authCall[0]).toBe(
        "https://sandbox.monnify.com/api/v1/auth/login"
      );
      expect(authCall[1].method).toBe("POST");
      const expectedAuth = Buffer.from("test-api-key:test-secret-key").toString(
        "base64"
      );
      expect(authCall[1].headers["Authorization"]).toBe(
        `Basic ${expectedAuth}`
      );
    });

    it("reuses a cached token if it has not expired", async () => {
      // First call: auth + disburse
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          requestSuccessful: true,
          responseBody: { accessToken: "cached-token", expiresIn: 3600 },
        }),
      });
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          requestSuccessful: true,
          responseBody: {
            amount: 1000,
            reference: "ref-a",
            transactionReference: "MNFY_A",
            status: "SUCCESS",
            totalFee: 10,
          },
        }),
      });

      await provider.disburse({
        amount: 1000,
        reference: "ref-a",
        narration: "First",
        destinationBankCode: "058",
        destinationAccountNumber: "0123456789",
        destinationAccountName: "Jane",
        currency: "NGN",
      });

      // Second call: should reuse token (no new auth call)
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          requestSuccessful: true,
          responseBody: {
            amount: 2000,
            reference: "ref-b",
            transactionReference: "MNFY_B",
            status: "SUCCESS",
            totalFee: 10,
          },
        }),
      });

      await provider.disburse({
        amount: 2000,
        reference: "ref-b",
        narration: "Second",
        destinationBankCode: "058",
        destinationAccountNumber: "0123456789",
        destinationAccountName: "Jane",
        currency: "NGN",
      });

      // auth was called only once (first fetch call)
      const authCalls = fetchMock.mock.calls.filter(([url]: [string]) =>
        url.includes("/auth/login")
      );
      expect(authCalls).toHaveLength(1);
    });
  });

  describe("disburse", () => {
    it("returns a mapped result on successful disbursement", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          requestSuccessful: true,
          responseBody: { accessToken: "tok", expiresIn: 3600 },
        }),
      });
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          requestSuccessful: true,
          responseBody: {
            amount: 75000,
            reference: "ref-ok",
            transactionReference: "MNFY_OK",
            status: "SUCCESS",
            totalFee: 26.88,
          },
        }),
      });

      const result = await provider.disburse({
        amount: 75000,
        reference: "ref-ok",
        narration: "Salary",
        destinationBankCode: "058",
        destinationAccountNumber: "1234567890",
        destinationAccountName: "Ada Lovelace",
        currency: "NGN",
      });

      expect(result).toEqual({
        reference: "ref-ok",
        providerReference: "MNFY_OK",
        status: "completed",
        amount: 75000,
        fee: 26.88,
      });
    });

    it("throws BadRequestError on 400 from Monnify", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          requestSuccessful: true,
          responseBody: { accessToken: "tok", expiresIn: 3600 },
        }),
      });
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          requestSuccessful: false,
          responseMessage: "Invalid account number",
          responseBody: null,
        }),
      });

      await expect(
        provider.disburse({
          amount: 1000,
          reference: "ref-bad",
          narration: "Bad",
          destinationBankCode: "058",
          destinationAccountNumber: "bad",
          destinationAccountName: "Nobody",
          currency: "NGN",
        })
      ).rejects.toThrow("Invalid account number");
    });

    it("throws UnauthorizedError when auth itself fails", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          requestSuccessful: false,
          responseBody: null,
        }),
      });

      await expect(
        provider.disburse({
          amount: 1000,
          reference: "ref-noauth",
          narration: "Fail auth",
          destinationBankCode: "058",
          destinationAccountNumber: "0123456789",
          destinationAccountName: "X",
          currency: "NGN",
        })
      ).rejects.toThrow("Monnify authentication failed");
    });

    it("maps PENDING_AUTHORIZATION status to pending", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          requestSuccessful: true,
          responseBody: { accessToken: "tok", expiresIn: 3600 },
        }),
      });
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          requestSuccessful: true,
          responseBody: {
            amount: 5000,
            reference: "ref-pend",
            transactionReference: "MNFY_PEND",
            status: "PENDING_AUTHORIZATION",
            totalFee: 10,
          },
        }),
      });

      const result = await provider.disburse({
        amount: 5000,
        reference: "ref-pend",
        narration: "Pending",
        destinationBankCode: "058",
        destinationAccountNumber: "0123456789",
        destinationAccountName: "Y",
        currency: "NGN",
      });

      expect(result.status).toBe("pending");
    });
  });
});
