CREATE TYPE "public"."invitation_role" AS ENUM('admin', 'hr_manager', 'payroll_manager', 'employee');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'declined', 'expired');--> statement-breakpoint
CREATE TABLE "organization_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"invited_by_user_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "invitation_role" NOT NULL,
	"token" varchar(255) NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"message" text,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"declined_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "transaction_cache" (
	"hash" text PRIMARY KEY NOT NULL,
	"result_json" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "routing_number" varchar(255);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "sort_code" varchar(255);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "iban" varchar(34);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "swift_code" varchar(11);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "account_type" varchar(50);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "account_holder_name" varchar(255);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "is_account_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "account_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "bank_address" varchar(500);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "bank_city" varchar(255);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "bank_country" varchar(255);--> statement-breakpoint
ALTER TABLE "organization_wallets" ADD COLUMN "virtual_account_number" varchar(20);--> statement-breakpoint
ALTER TABLE "organization_wallets" ADD COLUMN "virtual_bank_name" varchar(255);--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "organization_invitations_organization_id_idx" ON "organization_invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_invitations_email_idx" ON "organization_invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "organization_invitations_token_idx" ON "organization_invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "organization_invitations_status_idx" ON "organization_invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "employees_account_number_idx" ON "employees" USING btree ("account_number");--> statement-breakpoint
CREATE INDEX "employees_routing_number_idx" ON "employees" USING btree ("routing_number");--> statement-breakpoint
DROP TYPE "public"."timesheet_status";