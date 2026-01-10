CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_email" text NOT NULL,
	"actor_role" text NOT NULL,
	"action_type" text NOT NULL,
	"action_mode" text,
	"target_type" text,
	"target_identifier" text,
	"affected_count" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "authorizations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"command_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"projection_id" uuid NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"lease_id" uuid NOT NULL,
	"lease_valid_for_ms" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"cmd_counter" bigserial NOT NULL,
	"kman_hash" text NOT NULL,
	"bset_hash" text NOT NULL,
	"policy_seq" integer NOT NULL,
	"mode_id" text NOT NULL,
	"closure_op" text NOT NULL,
	"closure_d_def" text NOT NULL,
	"closure_d" integer NOT NULL,
	"action_type" text NOT NULL,
	"params" jsonb DEFAULT '{}' NOT NULL,
	"sig_alg" text NOT NULL,
	"sig_canonicalization" text NOT NULL,
	"sig_key_id" text NOT NULL,
	"sig_payload_hash" text NOT NULL,
	"sig_b64" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"executed_at" timestamp,
	"execution_result" jsonb,
	CONSTRAINT "authorizations_command_id_unique" UNIQUE("command_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog_permissions" (
	"id" text PRIMARY KEY DEFAULT 'main' NOT NULL,
	"allow_contributors" boolean DEFAULT false NOT NULL,
	"allow_operators" boolean DEFAULT true NOT NULL,
	"allow_creator" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"author" text NOT NULL,
	"author_name" text,
	"sandbox_id" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"featured" boolean DEFAULT false,
	"tags" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"sender_email" text NOT NULL,
	"sender_role" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"user_email" text NOT NULL,
	"role" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"sandbox_id" text,
	"name" text NOT NULL,
	"description" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "command_counters" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"counter_scope" text NOT NULL,
	"scope_key" text,
	"current_counter" bigserial DEFAULT 0 NOT NULL,
	"last_incremented_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enterprise_allocations" (
	"id" text PRIMARY KEY NOT NULL,
	"sandbox_id" text NOT NULL,
	"submission_hash" text NOT NULL,
	"contributor" text NOT NULL,
	"metal" text NOT NULL,
	"epoch" text NOT NULL,
	"tier" text,
	"reward" numeric(20, 0) NOT NULL,
	"tier_multiplier" numeric(10, 4) DEFAULT '1.0' NOT NULL,
	"epoch_balance_before" numeric(20, 0) NOT NULL,
	"epoch_balance_after" numeric(20, 0) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enterprise_contributions" (
	"submission_hash" text PRIMARY KEY NOT NULL,
	"sandbox_id" text NOT NULL,
	"title" text NOT NULL,
	"contributor" text NOT NULL,
	"content_hash" text NOT NULL,
	"text_content" text,
	"pdf_path" text,
	"status" text DEFAULT 'evaluating' NOT NULL,
	"category" text,
	"metals" jsonb,
	"metadata" jsonb,
	"embedding" jsonb,
	"vector_x" numeric(20, 10),
	"vector_y" numeric(20, 10),
	"vector_z" numeric(20, 10),
	"embedding_model" text,
	"vector_generated_at" timestamp,
	"registered" boolean DEFAULT false,
	"registration_date" timestamp,
	"registration_tx_hash" text,
	"stripe_payment_id" text,
	"is_seed" boolean DEFAULT false,
	"is_edge" boolean DEFAULT false,
	"has_sweet_spot_edges" boolean DEFAULT false,
	"overlap_percent" numeric(5, 2) DEFAULT '0',
	"snapshot_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enterprise_sandboxes" (
	"id" text PRIMARY KEY NOT NULL,
	"operator" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"vault_status" text DEFAULT 'paused' NOT NULL,
	"tokenized" boolean DEFAULT false,
	"token_address" text,
	"token_name" text,
	"token_symbol" text,
	"token_supply" numeric(20, 0),
	"current_epoch" text DEFAULT 'founder' NOT NULL,
	"scoring_config" jsonb,
	"subscription_tier" text,
	"node_count" integer DEFAULT 0,
	"stripe_subscription_id" text,
	"stripe_customer_id" text,
	"synth_balance" numeric(20, 0) DEFAULT '0',
	"synth_activated" boolean DEFAULT false,
	"synth_activated_at" timestamp,
	"synth_activation_fee" numeric(20, 0) DEFAULT '10000',
	"current_reach_tier" text,
	"last_billing_cycle" timestamp,
	"testing_mode" boolean DEFAULT true,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "epoch_metal_balances" (
	"id" text PRIMARY KEY NOT NULL,
	"epoch" text NOT NULL,
	"metal" text NOT NULL,
	"balance" numeric(20, 0) NOT NULL,
	"threshold" numeric(20, 0) NOT NULL,
	"distribution_amount" numeric(20, 0) NOT NULL,
	"distribution_percent" numeric(5, 2) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "execution_audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"command_id" uuid NOT NULL,
	"authorization_id" bigserial NOT NULL,
	"projection_id" uuid NOT NULL,
	"proposal_id" uuid NOT NULL,
	"executed_at" timestamp DEFAULT now() NOT NULL,
	"action_type" text NOT NULL,
	"params" jsonb DEFAULT '{}' NOT NULL,
	"success" boolean NOT NULL,
	"result" jsonb,
	"error_message" text,
	"error_code" text,
	"db_writes" jsonb,
	"payment_created" jsonb,
	"blockchain_tx" jsonb,
	"counter_verified" boolean NOT NULL,
	"lease_verified" boolean NOT NULL,
	"policy_verified" boolean NOT NULL,
	"signature_verified" boolean NOT NULL,
	"duration_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leases" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"lease_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"valid_for_ms" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"authorization_id" bigserial NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"revoked_at" timestamp,
	"revoke_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "leases_lease_id_unique" UNIQUE("lease_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "policy_versions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"policy_seq" integer NOT NULL,
	"kman_hash" text NOT NULL,
	"bset_hash" text NOT NULL,
	"kman_content" jsonb NOT NULL,
	"bset_content" jsonb NOT NULL,
	"effective_at" timestamp DEFAULT now() NOT NULL,
	"superseded_at" timestamp,
	"created_by" text,
	"justification" text,
	"requires_governance" boolean DEFAULT false,
	"approved_by" text[] DEFAULT '{}',
	"approval_threshold" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "policy_versions_policy_seq_unique" UNIQUE("policy_seq")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projected_commands" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"projection_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"kman_hash" text NOT NULL,
	"bset_hash" text NOT NULL,
	"policy_seq" integer NOT NULL,
	"mode_id" text NOT NULL,
	"closure_op" text NOT NULL,
	"closure_d_def" text NOT NULL,
	"closure_d" integer NOT NULL,
	"action_type" text NOT NULL,
	"params" jsonb DEFAULT '{}' NOT NULL,
	"risk_tier" integer NOT NULL,
	"artifact_sink_ref" text,
	"artifact_class" text NOT NULL,
	"checks_passed" text[] DEFAULT '{}',
	"is_veto" boolean DEFAULT false NOT NULL,
	"veto_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"projected_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	CONSTRAINT "projected_commands_projection_id_unique" UNIQUE("projection_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "proposal_envelopes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"proposal_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"intent" text NOT NULL,
	"action_type" text NOT NULL,
	"params" jsonb DEFAULT '{}' NOT NULL,
	"run_id" text NOT NULL,
	"inputs_hash" text NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"temperature" numeric(5, 3) NOT NULL,
	"prompt_hash" text NOT NULL,
	"content_hash" text,
	"seed" integer,
	"score_config_id" text NOT NULL,
	"archive_snapshot_id" text NOT NULL,
	"mode_state" text,
	"seed_on" boolean DEFAULT false,
	"edge_on" boolean DEFAULT false,
	"overlap_on" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text,
	"submission_hash" text,
	"status" text DEFAULT 'pending' NOT NULL,
	CONSTRAINT "proposal_envelopes_proposal_id_unique" UNIQUE("proposal_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sandbox_metrics" (
	"sandbox_id" text PRIMARY KEY NOT NULL,
	"unique_contributors" integer DEFAULT 0 NOT NULL,
	"total_submissions" integer DEFAULT 0 NOT NULL,
	"total_evaluations" integer DEFAULT 0 NOT NULL,
	"total_registrations" integer DEFAULT 0 NOT NULL,
	"total_allocations" integer DEFAULT 0 NOT NULL,
	"total_analytics_queries" integer DEFAULT 0 NOT NULL,
	"last_calculated_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sandbox_synth_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"sandbox_id" text NOT NULL,
	"transaction_type" text NOT NULL,
	"amount" numeric(20, 0) NOT NULL,
	"balance_before" numeric(20, 0) NOT NULL,
	"balance_after" numeric(20, 0) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scoring_config" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "scoring_config_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"config_key" text NOT NULL,
	"config_value" jsonb NOT NULL,
	"version" text DEFAULT 'v1.0.0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "scoring_config_config_key_unique" UNIQUE("config_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "social_post_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"author_email" text NOT NULL,
	"author_role" text NOT NULL,
	"content" text NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "social_post_likes" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "social_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"sandbox_id" text,
	"author_email" text NOT NULL,
	"author_role" text NOT NULL,
	"content" text NOT NULL,
	"image_url" text,
	"image_path" text,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"comments_count" integer DEFAULT 0 NOT NULL,
	"is_pinned" boolean DEFAULT false,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_broadcasts" (
	"id" text PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"nature" text DEFAULT 'info' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "contributions" ALTER COLUMN "status" SET DEFAULT 'evaluating';--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "embedding" jsonb;--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "vector_x" numeric(20, 10);--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "vector_y" numeric(20, 10);--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "vector_z" numeric(20, 10);--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "embedding_model" text;--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "vector_generated_at" timestamp;--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "registered" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "registration_date" timestamp;--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "registration_tx_hash" text;--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "stripe_payment_id" text;--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "is_seed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "is_edge" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "has_sweet_spot_edges" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "overlap_percent" numeric(5, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "snapshot_id" text;--> statement-breakpoint
ALTER TABLE "tokenomics" ADD COLUMN "total_supply_gold" numeric(20, 0) DEFAULT '45000000000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "tokenomics" ADD COLUMN "total_supply_silver" numeric(20, 0) DEFAULT '22500000000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "tokenomics" ADD COLUMN "total_supply_copper" numeric(20, 0) DEFAULT '22500000000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "tokenomics" ADD COLUMN "total_distributed_gold" numeric(20, 0) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "tokenomics" ADD COLUMN "total_distributed_silver" numeric(20, 0) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "tokenomics" ADD COLUMN "total_distributed_copper" numeric(20, 0) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "profile_picture_url" text;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_sandbox_id_enterprise_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."enterprise_sandboxes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sandbox_metrics" ADD CONSTRAINT "sandbox_metrics_sandbox_id_enterprise_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."enterprise_sandboxes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sandbox_synth_transactions" ADD CONSTRAINT "sandbox_synth_transactions_sandbox_id_enterprise_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."enterprise_sandboxes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
