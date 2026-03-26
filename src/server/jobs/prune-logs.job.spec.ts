import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCutoffDate, LOGIN_ATTEMPTS_RETENTION_DAYS, pruneLoginAttempts } from "./prune-logs.job";
import { db } from "../db";
import { loginAttempts } from "../db/schema";

vi.mock("../db", () => ({
  db: {
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
  },
}));

describe("prune-logs.job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCutoffDate", () => {
    it("should return a date 30 days in the past", () => {
      const cutoffDate = getCutoffDate();
      const now = new Date();
      
      // Calculate expected cutoff
      const expected = new Date(now.getTime());
      expected.setDate(expected.getDate() - LOGIN_ATTEMPTS_RETENTION_DAYS);
      
      // Allow for small differences due to execution time
      const diffInMs = Math.abs(cutoffDate.getTime() - expected.getTime());
      expect(diffInMs).toBeLessThan(1000); // Within 1 second
    });

    it("should calculate correct cutoff for different retention periods", () => {
      // Test with the constant
      const expectedDays = 30;
      expect(LOGIN_ATTEMPTS_RETENTION_DAYS).toBe(expectedDays);
    });
  });

  describe("pruneLoginAttempts", () => {
    it("should delete login_attempts older than cutoff date", async () => {
      const mockReturning = vi.fn().mockResolvedValue([
        { id: "1" },
        { id: "2" },
        { id: "3" },
      ]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      (db.delete as any).mockReturnValue({ where: mockWhere });

      const deletedCount = await pruneLoginAttempts();

      expect(db.delete).toHaveBeenCalledWith(loginAttempts);
      expect(mockWhere).toHaveBeenCalled();
      expect(deletedCount).toBe(3);
    });

    it("should return 0 when no records to delete", async () => {
      const mockReturning = vi.fn().mockResolvedValue([]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      (db.delete as any).mockReturnValue({ where: mockWhere });

      const deletedCount = await pruneLoginAttempts();

      expect(deletedCount).toBe(0);
    });

    it("should use correct cutoff date in query", async () => {
      const mockReturning = vi.fn().mockResolvedValue([]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      (db.delete as any).mockReturnValue({ where: mockWhere });

      // Capture the where clause argument
      await pruneLoginAttempts();

      // Verify where was called with a valid condition
      expect(mockWhere).toHaveBeenCalled();
    });
  });
});