import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { UnauthorizedError } from "@/server/utils/errors";

vi.mock("@/server/utils/auth", () => ({
  AuthUtils: {
    authenticateRequestOrRefreshCookie: vi.fn(),
  },
}));

vi.mock("@/server/services/finance-wallet.service", () => ({
  FinanceWalletService: {
    getOrganizationWallet: vi.fn(),
    ensureVirtualAccount: vi.fn(),
  },
}));

import { GET, POST } from "./route";
import { AuthUtils } from "@/server/utils/auth";
import { FinanceWalletService } from "@/server/services/finance-wallet.service";

describe("/api/finance/wallet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns wallet details for the authenticated organization", async () => {
    vi.mocked(AuthUtils.authenticateRequestOrRefreshCookie).mockResolvedValue({
      userId: "user-1",
      email: "admin@vestroll.com",
      user: {
        organizationId: "org-1",
      },
    } as any);

    vi.mocked(FinanceWalletService.getOrganizationWallet).mockResolvedValue({
      walletId: "wallet-1",
      organizationId: "org-1",
      virtualAccountNumber: "1029384756",
      virtualBankName: "Providus Bank",
      hasVirtualAccount: true,
    });

    const response = await GET(
      new NextRequest("http://localhost:3000/api/finance/wallet"),
    );

    expect(response.status).toBe(200);
    expect(FinanceWalletService.getOrganizationWallet).toHaveBeenCalledWith(
      "org-1",
    );

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.virtualAccountNumber).toBe("1029384756");
    expect(data.data.virtualBankName).toBe("Providus Bank");
  });

  it("returns 401 when wallet details are requested without authentication", async () => {
    vi.mocked(AuthUtils.authenticateRequestOrRefreshCookie).mockRejectedValue(
      new UnauthorizedError(),
    );

    const response = await GET(
      new NextRequest("http://localhost:3000/api/finance/wallet"),
    );

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  it("generates virtual account details when missing", async () => {
    vi.mocked(AuthUtils.authenticateRequestOrRefreshCookie).mockResolvedValue({
      userId: "user-1",
      email: "admin@vestroll.com",
      user: {
        organizationId: "org-1",
      },
    } as any);

    vi.mocked(FinanceWalletService.ensureVirtualAccount).mockResolvedValue({
      walletId: "wallet-1",
      organizationId: "org-1",
      virtualAccountNumber: "5647382910",
      virtualBankName: "Wema Bank",
      hasVirtualAccount: true,
    });

    const response = await POST(
      new NextRequest("http://localhost:3000/api/finance/wallet", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    expect(FinanceWalletService.ensureVirtualAccount).toHaveBeenCalledWith(
      "org-1",
    );

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.virtualAccountNumber).toBe("5647382910");
  });
});
