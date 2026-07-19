CREATE TABLE "agent_run" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"team_id" text,
	"agent_type" text,
	"action" text,
	"input" text,
	"output" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"duration" integer,
	"cost" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "composio_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"team_id" text,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expires_at" timestamp NOT NULL,
	"provider" text,
	"scope" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "team_member" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"team_id" text NOT NULL,
	"created_by" text NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"definition" jsonb NOT NULL,
	"tags" text[],
	"runs" integer DEFAULT 0 NOT NULL,
	"last_run_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_run" ADD CONSTRAINT "agent_run_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_run" ADD CONSTRAINT "agent_run_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "composio_session" ADD CONSTRAINT "composio_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "composio_session" ADD CONSTRAINT "composio_session_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agent_run_user" ON "agent_run" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_agent_run_team" ON "agent_run" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_agent_run_created" ON "agent_run" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_agent_run_status" ON "agent_run" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_composio_session_unique" ON "composio_session" USING btree ("user_id","provider");--> statement-breakpoint
CREATE INDEX "idx_composio_session_expires" ON "composio_session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_team_created_by" ON "team" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_team_slug" ON "team" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_team_member_unique" ON "team_member" USING btree ("team_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_team_member_user" ON "team_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_team" ON "workflow" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_created_by" ON "workflow" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_workflow_published" ON "workflow" USING btree ("is_published");