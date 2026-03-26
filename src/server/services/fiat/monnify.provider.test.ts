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
});
