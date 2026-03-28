import { db } from "../db";
import { loginAttempts } from "../db/schema";
import { lt } from "drizzle-orm";

/**
 * Number of days to retain login_attempts records
 */
export const LOGIN_ATTEMPTS_RETENTION_DAYS = 30;

/**
 * Calculates the cutoff date for pruning login attempts
 * @returns Date object representing the cutoff (current date minus retention days)
 */
export function getCutoffDate(): Date {
  const now = new Date();
  const cutoff = new Date(now.getTime());
  cutoff.setDate(cutoff.getDate() - LOGIN_ATTEMPTS_RETENTION_DAYS);
  return cutoff;
}

/**
 * PruneLogs job - deletes login_attempts older than 30 days
 * @returns Number of deleted records
 */
export async function pruneLoginAttempts(): Promise<number> {
  const cutoffDate = getCutoffDate();
  
  const result = await db
    .delete(loginAttempts)
    .where(lt(loginAttempts.createdAt, cutoffDate))
    .returning({ id: loginAttempts.id });
  
  return result.length;
}