-- Migration: 0010_add_transaction_cache
-- Adds the transaction_cache table for idempotent transaction submissions (Issue #317)

CREATE TABLE IF NOT EXISTS "transaction_cache" (
  "hash" text PRIMARY KEY NOT NULL,
  "result_json" text NOT NULL,
  "expires_at" timestamp NOT NULL
);--> statement-breakpoint
