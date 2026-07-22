import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_video_width" AS ENUM('auto', '1/3', '1/2', '2/3', 'full');
  CREATE TYPE "public"."enum_pages_blocks_video_max_height" AS ENUM('sm', 'md', 'lg', 'xl', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_video_width" AS ENUM('auto', '1/3', '1/2', '2/3', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_video_max_height" AS ENUM('sm', 'md', 'lg', 'xl', 'none');
  CREATE TABLE "pages_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"video_url" varchar,
  	"poster_id" integer,
  	"poster_url" varchar,
  	"caption" varchar,
  	"width" "enum_pages_blocks_video_width" DEFAULT 'full',
  	"max_height" "enum_pages_blocks_video_max_height" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"video_url" varchar,
  	"poster_id" integer,
  	"poster_url" varchar,
  	"caption" varchar,
  	"width" "enum__pages_v_blocks_video_width" DEFAULT 'full',
  	"max_height" "enum__pages_v_blocks_video_max_height" DEFAULT 'md',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_video_order_idx" ON "pages_blocks_video" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_parent_id_idx" ON "pages_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_path_idx" ON "pages_blocks_video" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_media_idx" ON "pages_blocks_video" USING btree ("media_id");
  CREATE INDEX "pages_blocks_video_poster_idx" ON "pages_blocks_video" USING btree ("poster_id");
  CREATE INDEX "_pages_v_blocks_video_order_idx" ON "_pages_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_parent_id_idx" ON "_pages_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_path_idx" ON "_pages_v_blocks_video" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_media_idx" ON "_pages_v_blocks_video" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_video_poster_idx" ON "_pages_v_blocks_video" USING btree ("poster_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_video" CASCADE;
  DROP TABLE "_pages_v_blocks_video" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_video_width";
  DROP TYPE "public"."enum_pages_blocks_video_max_height";
  DROP TYPE "public"."enum__pages_v_blocks_video_width";
  DROP TYPE "public"."enum__pages_v_blocks_video_max_height";`)
}
