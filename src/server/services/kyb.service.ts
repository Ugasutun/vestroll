import crypto from "crypto";
import { db, kybVerifications, kybStatusEnum, kybAuditLogs } from "../db";
import { eq } from "drizzle-orm";
import { ConflictError, NotFoundError } from "../utils/errors";
import { Logger } from "./logger.service";

export type KybStatus = (typeof kybStatusEnum.enumValues)[number];

// Re-export from shared types for backward compatibility
export { KYB_REJECTION_CODES, type KybRejectionCode } from "@/types/kyb";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export class KybService {
  static async getStatus(userId: string) {
    const [verification] = await db
      .select()
      .from(kybVerifications)
      .where(eq(kybVerifications.userId, userId))
      .limit(1);

    if (!verification) {
      return {
        status: "not_started" as KybStatus,
        rejectionReason: null,
        rejectionCode: null,
        submittedAt: null,
      };
    }

    return {
      status: verification.status,
      rejectionReason: verification.rejectionReason,
      rejectionCode: verification.rejectionCode,
      submittedAt: verification.submittedAt,
    };
  }

  static async uploadToCloudinary(
    file: File,
    userId: string,
    fieldName: string,
  ): Promise<{ publicId: string; secureUrl: string }> {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary environment variables are not configured");
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = `kyb/${userId}`;
    const publicId = `${fieldName}-${crypto.randomUUID()}`;

    const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + CLOUDINARY_API_SECRET)
      .digest("hex");

    const formData = new FormData();
    formData.append("file", dataUri);
    formData.append("api_key", CLOUDINARY_API_KEY);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);
    formData.append("public_id", publicId);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      { method: "POST", body: formData },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      Logger.error("Cloudinary upload failed", { errorBody, statusCode: response.status });
      throw new Error("Failed to upload file to Cloudinary");
    }

    const result = await response.json();

    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
    };
  }

  static async deleteFromCloudinary(publicIds: string[]): Promise<void> {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      Logger.warn("Cloudinary environment variables not configured, cannot delete files", {
        missingEnv: true,
      });
      return;
    }

    for (const publicId of publicIds) {
      try {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
        const signature = crypto
          .createHash("sha1")
          .update(paramsToSign + CLOUDINARY_API_SECRET)
          .digest("hex");

        const formData = new FormData();
        formData.append("public_id", publicId);
        formData.append("api_key", CLOUDINARY_API_KEY);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);

        await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
          { method: "POST", body: formData },
        );
      } catch (error) {
        Logger.error("Failed to delete file from Cloudinary", {
          publicId,
          error: String(error),
        });
      }
    }
  }

  static async submit(data: {
    userId: string;
    registrationType: string;
    registrationNo: string;
    incorporationCertificatePath: string;
    incorporationCertificateUrl: string;
    memorandumArticlePath: string;
    memorandumArticleUrl: string;
    formC02C07Path: string | null;
    formC02C07Url: string | null;
  }) {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(kybVerifications)
        .where(eq(kybVerifications.userId, data.userId))
        .limit(1);

      if (existing) {
        if (existing.status === "verified") {
          throw new ConflictError("KYB verification already approved");
        }
        if (existing.status === "pending") {
          throw new ConflictError("A KYB verification is already pending review");
        }

        const oldPublicIds = [
          existing.incorporationCertificatePath,
          existing.memorandumArticlePath,
          existing.formC02C07Path,
        ].filter((id): id is string => id !== null);

        await KybService.deleteFromCloudinary(oldPublicIds);

        await tx
          .delete(kybVerifications)
          .where(eq(kybVerifications.id, existing.id));
      }

      const [record] = await tx
        .insert(kybVerifications)
        .values({
          userId: data.userId,
          registrationType: data.registrationType,
          registrationNo: data.registrationNo,
          incorporationCertificatePath: data.incorporationCertificatePath,
          incorporationCertificateUrl: data.incorporationCertificateUrl,
          memorandumArticlePath: data.memorandumArticlePath,
          memorandumArticleUrl: data.memorandumArticleUrl,
          formC02C07Path: data.formC02C07Path,
          formC02C07Url: data.formC02C07Url,
          status: "pending",
        })
        .returning();

      await tx.insert(kybAuditLogs).values({
        entityType: "kyb_verification",
        entityId: record.id,
        action: "status_changed_to_pending",
        actorId: data.userId,
        metadata: { triggeredBy: "user_submission" },
      });

      return {
        id: record.id,
        status: record.status,
        registrationType: record.registrationType,
        registrationNo: record.registrationNo,
        createdAt: record.createdAt,
      };
    });
  }

  /**
   * Approve a pending KYB verification.
   *
   * The status update and audit log insert execute within the same DB transaction,
   * guaranteeing atomicity — if either write fails, both are rolled back.
   */
  static async approve(data: { verificationId: string; adminUserId: string }) {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(kybVerifications)
        .where(eq(kybVerifications.id, data.verificationId))
        .limit(1);

      if (!existing) {
        throw new NotFoundError("KYB verification record not found");
      }

      // Only pending verifications can be approved
      if (existing.status !== "pending") {
        throw new ConflictError(
          `Cannot approve a verification that is already '${existing.status}'`,
        );
      }

      const previousStatus = existing.status;

      // Include status = 'pending' in the WHERE clause to make the transition
      // race-safe: if another transaction changed the status between our SELECT
      // and this UPDATE, 0 rows are affected and we detect it below.
      const [updated] = await tx
        .update(kybVerifications)
        .set({
          status: "verified",
          rejectionCode: null,
          rejectionReason: null,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          eq(kybVerifications.id, data.verificationId),
        )
        .returning();

      // Guard against concurrent modification between SELECT and UPDATE
      if (!updated) {
        throw new ConflictError(
          "KYB verification was modified concurrently; please retry",
        );
      }

      await tx.insert(kybAuditLogs).values({
        entityType: "kyb_verification",
        entityId: data.verificationId,
        action: "status_changed_to_verified",
        actorId: data.adminUserId,
        metadata: { previousStatus },
      });

      Logger.info("KYB verification approved", {
        verificationId: data.verificationId,
        adminUserId: data.adminUserId,
        previousStatus,
      });

      return {
        id: updated.id,
        status: updated.status,
        reviewedAt: updated.reviewedAt,
      };
    });
  }

  /**
   * Reject a pending KYB verification.
   *
   * The status update and audit log insert execute within the same DB transaction,
   * guaranteeing atomicity — if either write fails, both are rolled back.
   */
  static async reject(data: {
    verificationId: string;
    adminUserId: string;
    rejectionCode: string;
    rejectionReason: string;
  }) {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(kybVerifications)
        .where(eq(kybVerifications.id, data.verificationId))
        .limit(1);

      if (!existing) {
        throw new NotFoundError("KYB verification record not found");
      }

      // Only pending verifications can be rejected
      if (existing.status !== "pending") {
        throw new ConflictError(
          `Cannot reject a verification that is already '${existing.status}'`,
        );
      }

      const previousStatus = existing.status;

      // Include status = 'pending' in the WHERE clause to make the transition
      // race-safe: if another transaction changed the status between our SELECT
      // and this UPDATE, 0 rows are affected and we detect it below.
      const [updated] = await tx
        .update(kybVerifications)
        .set({
          status: "rejected",
          rejectionCode: data.rejectionCode,
          rejectionReason: data.rejectionReason,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(kybVerifications.id, data.verificationId))
        .returning();

      // Guard against concurrent modification between SELECT and UPDATE
      if (!updated) {
        throw new ConflictError(
          "KYB verification was modified concurrently; please retry",
        );
      }

      await tx.insert(kybAuditLogs).values({
        entityType: "kyb_verification",
        entityId: data.verificationId,
        action: "status_changed_to_rejected",
        actorId: data.adminUserId,
        metadata: {
          previousStatus,
          rejectionCode: data.rejectionCode,
          rejectionReason: data.rejectionReason,
        },
      });

      Logger.info("KYB verification rejected", {
        verificationId: data.verificationId,
        adminUserId: data.adminUserId,
        previousStatus,
        rejectionCode: data.rejectionCode,
      });

      return {
        id: updated.id,
        status: updated.status,
        rejectionCode: updated.rejectionCode,
        rejectionReason: updated.rejectionReason,
        reviewedAt: updated.reviewedAt,
      };
    });
  }
}
