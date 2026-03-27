-- Add slug column to organizations table
ALTER TABLE "organizations" ADD COLUMN "slug" varchar(255) NOT NULL DEFAULT '';
--> statement-breakpoint
-- Add unique constraint on slug
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_slug_unique" UNIQUE("slug");
