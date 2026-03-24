import { db, organizations } from "../db";
import { eq, isNull, and } from "drizzle-orm";
import { NotFoundError } from "../utils/errors";

export interface Organization {
  id: string;
  name: string;
  industry: string | null;
  registrationNumber: string | null;
  registeredStreet: string | null;
  registeredCity: string | null;
  registeredState: string | null;
  registeredPostalCode: string | null;
  registeredCountry: string | null;
  billingStreet: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingPostalCode: string | null;
  billingCountry: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class OrganizationService {
  /**
   * Soft delete an organization by setting the deletedAt timestamp
   */
  static async softDelete(organizationId: string): Promise<void> {
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!organization) {
      throw new NotFoundError("Organization not found");
    }

    await db
      .update(organizations)
      .set({ deletedAt: new Date() })
      .where(eq(organizations.id, organizationId));
  }

  /**
   * Restore a soft-deleted organization by clearing the deletedAt timestamp
   */
  static async restore(organizationId: string): Promise<void> {
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!organization) {
      throw new NotFoundError("Organization not found");
    }

    await db
      .update(organizations)
      .set({ deletedAt: null })
      .where(eq(organizations.id, organizationId));
  }

  /**
   * Get all active (non-deleted) organizations
   */
  static async getActiveOrganizations(): Promise<Organization[]> {
    return await db
      .select()
      .from(organizations)
      .where(isNull(organizations.deletedAt));
  }

  /**
   * Get a single organization by ID (only if not deleted)
   */
  static async getById(organizationId: string): Promise<Organization | null> {
    const [organization] = await db
      .select()
      .from(organizations)
      .where(
        and(
          eq(organizations.id, organizationId),
          isNull(organizations.deletedAt)
        )
      )
      .limit(1);

    return organization || null;
  }

  /**
   * Get organization by ID regardless of deleted status (for admin purposes)
   */
  static async getByIdIncludingDeleted(
    organizationId: string
  ): Promise<Organization | null> {
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    return organization || null;
  }

  /**
   * Get all organizations including deleted ones (for admin purposes)
   */
  static async getAllOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations);
  }

  /**
   * Permanently delete an organization (hard delete - use with caution)
   */
  static async hardDelete(organizationId: string): Promise<void> {
    await db.delete(organizations).where(eq(organizations.id, organizationId));
  }
}
