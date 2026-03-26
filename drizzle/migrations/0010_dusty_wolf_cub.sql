CREATE TYPE "public"."fiat_transaction_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."fiat_transaction_type" AS ENUM('deposit', 'withdrawal', 'payout');--> statement-breakpoint
CREATE TABLE "fiat_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"amount" bigint NOT NULL,
	"type" "fiat_transaction_type" NOT NULL,
	"status" "fiat_transaction_status" DEFAULT 'pending' NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_reference" varchar(255) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fiat_transactions_provider_reference_unique" UNIQUE("provider_reference")
);
--> statement-breakpoint
ALTER TABLE "fiat_transactions" ADD CONSTRAINT "fiat_transactions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fiat_transactions_organization_id_idx" ON "fiat_transactions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "fiat_transactions_status_idx" ON "fiat_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fiat_transactions_type_idx" ON "fiat_transactions" USING btree ("type");