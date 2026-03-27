-- Migration: Add kyb_audit_logs table for tracking KYB status transitions
-- Issue #313: Audit log entry for every KYB status change

CREATE TABLE "kyb_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" varchar(255) NOT NULL,
	"actor_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "kyb_audit_logs_entity_id_idx" ON "kyb_audit_logs" USING btree ("entity_id");
--> statement-breakpoint
CREATE INDEX "kyb_audit_logs_actor_id_idx" ON "kyb_audit_logs" USING btree ("actor_id");
--> statement-breakpoint
ALTER TABLE "kyb_audit_logs" ADD CONSTRAINT "kyb_audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
