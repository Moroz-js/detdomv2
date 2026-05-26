import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_form_tabs_tabs" AS ENUM('help_request', 'want_to_help', 'feedback');
  CREATE TYPE "public"."enum_pages_blocks_file_list_items_file_ext" AS ENUM('pdf', 'docx', 'doc', 'xlsx', 'xls', 'zip', 'other');
  CREATE TYPE "public"."enum_pages_blocks_gallery_source" AS ENUM('achievements', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_container_columns" AS ENUM('1', '2', '3', '4', '5', '6');
  CREATE TYPE "public"."enum__pages_v_blocks_form_tabs_tabs" AS ENUM('help_request', 'want_to_help', 'feedback');
  CREATE TYPE "public"."enum__pages_v_blocks_file_list_items_file_ext" AS ENUM('pdf', 'docx', 'doc', 'xlsx', 'xls', 'zip', 'other');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_source" AS ENUM('achievements', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_container_columns" AS ENUM('1', '2', '3', '4', '5', '6');
  CREATE TYPE "public"."enum_news_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_form_submissions_form_type" AS ENUM('help_request', 'want_to_help', 'feedback');
  CREATE TYPE "public"."enum_form_submissions_status" AS ENUM('new', 'in_progress', 'done');
  CREATE TABLE "pages_blocks_form_tabs_tabs" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_form_tabs_tabs",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"html" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_url" varchar,
  	"alt" varchar,
  	"caption" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"source" "enum_pages_blocks_gallery_source" DEFAULT 'achievements',
  	"year" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_home_slider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_container" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"columns" "enum_pages_blocks_container_columns" DEFAULT '2',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_form_tabs_tabs" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_form_tabs_tabs",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"html" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_url" varchar,
  	"alt" varchar,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"source" "enum__pages_v_blocks_gallery_source" DEFAULT 'achievements',
  	"year" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_home_slider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_container" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"columns" "enum__pages_v_blocks_container_columns" DEFAULT '2',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "news_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "news_gallery_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"alt" varchar
  );
  
  CREATE TABLE "news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"thumbnail_id" integer,
  	"thumbnail_url" varchar,
  	"content" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_news_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_news_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_news_v_version_gallery_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"alt" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_news_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_thumbnail_id" integer,
  	"version_thumbnail_url" varchar,
  	"version_content" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__news_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "achievements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" numeric NOT NULL,
  	"title" varchar,
  	"year" numeric,
  	"image_id" integer,
  	"image_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_type" "enum_form_submissions_form_type" NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar,
  	"email" varchar,
  	"subject" varchar,
  	"message" varchar NOT NULL,
  	"page_slug" varchar,
  	"status" "enum_form_submissions_status" DEFAULT 'new' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "footer_content" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nav_section_title" varchar DEFAULT 'Основные разделы',
  	"contacts_section_title" varchar DEFAULT 'Контакты',
  	"contacts_body" jsonb,
  	"extra_body" jsonb,
  	"copyright_organization" varchar DEFAULT 'КГКУ «Комплексный центр помощи семье и детям г. Уссурийска»',
  	"bus_badge_image_url" varchar DEFAULT 'https://detskiydomuss.ru/wp-content/themes/detdom/assets/img/footer-image.png',
  	"bus_badge_image_alt" varchar DEFAULT 'bus.gov.ru — результаты независимой оценки качества оказания услуг',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_slider_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_url" varchar,
  	"alt" varchar,
  	"href" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "home_slider" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "image_id" integer;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "image_url" varchar;
  ALTER TABLE "pages_blocks_banner" ADD COLUMN "image_url" varchar;
  ALTER TABLE "pages_blocks_banner" ADD COLUMN "alt" varchar;
  ALTER TABLE "pages_blocks_slider_slides" ADD COLUMN "image_url" varchar;
  ALTER TABLE "pages_blocks_slider_slides" ADD COLUMN "alt" varchar;
  ALTER TABLE "pages_blocks_image" ADD COLUMN "image_url" varchar;
  ALTER TABLE "pages_blocks_image" ADD COLUMN "alt" varchar;
  ALTER TABLE "pages_blocks_heading" ADD COLUMN "anchor_id" varchar;
  ALTER TABLE "pages_blocks_file_list_items" ADD COLUMN "file_url" varchar;
  ALTER TABLE "pages_blocks_file_list_items" ADD COLUMN "file_ext" "enum_pages_blocks_file_list_items_file_ext" DEFAULT 'pdf';
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "image_id" integer;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "image_url" varchar;
  ALTER TABLE "_pages_v_blocks_banner" ADD COLUMN "image_url" varchar;
  ALTER TABLE "_pages_v_blocks_banner" ADD COLUMN "alt" varchar;
  ALTER TABLE "_pages_v_blocks_slider_slides" ADD COLUMN "image_url" varchar;
  ALTER TABLE "_pages_v_blocks_slider_slides" ADD COLUMN "alt" varchar;
  ALTER TABLE "_pages_v_blocks_image" ADD COLUMN "image_url" varchar;
  ALTER TABLE "_pages_v_blocks_image" ADD COLUMN "alt" varchar;
  ALTER TABLE "_pages_v_blocks_heading" ADD COLUMN "anchor_id" varchar;
  ALTER TABLE "_pages_v_blocks_file_list_items" ADD COLUMN "file_url" varchar;
  ALTER TABLE "_pages_v_blocks_file_list_items" ADD COLUMN "file_ext" "enum__pages_v_blocks_file_list_items_file_ext" DEFAULT 'pdf';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "news_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "achievements_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "form_submissions_id" integer;
  ALTER TABLE "pages_blocks_form_tabs_tabs" ADD CONSTRAINT "pages_blocks_form_tabs_tabs_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_form_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_embed" ADD CONSTRAINT "pages_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_items" ADD CONSTRAINT "pages_blocks_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_items" ADD CONSTRAINT "pages_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_slider" ADD CONSTRAINT "pages_blocks_home_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_container" ADD CONSTRAINT "pages_blocks_container_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_tabs_tabs" ADD CONSTRAINT "_pages_v_blocks_form_tabs_tabs_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_form_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_embed" ADD CONSTRAINT "_pages_v_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_items" ADD CONSTRAINT "_pages_v_blocks_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_items" ADD CONSTRAINT "_pages_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_slider" ADD CONSTRAINT "_pages_v_blocks_home_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_container" ADD CONSTRAINT "_pages_v_blocks_container_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_gallery" ADD CONSTRAINT "news_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_gallery" ADD CONSTRAINT "news_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_gallery_urls" ADD CONSTRAINT "news_gallery_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v_version_gallery" ADD CONSTRAINT "_news_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v_version_gallery" ADD CONSTRAINT "_news_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_version_gallery_urls" ADD CONSTRAINT "_news_v_version_gallery_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_parent_id_news_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "achievements" ADD CONSTRAINT "achievements_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_slider_slides" ADD CONSTRAINT "home_slider_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_slider_slides" ADD CONSTRAINT "home_slider_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_slider"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_form_tabs_tabs_order_idx" ON "pages_blocks_form_tabs_tabs" USING btree ("order");
  CREATE INDEX "pages_blocks_form_tabs_tabs_parent_idx" ON "pages_blocks_form_tabs_tabs" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_embed_order_idx" ON "pages_blocks_embed" USING btree ("_order");
  CREATE INDEX "pages_blocks_embed_parent_id_idx" ON "pages_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_embed_path_idx" ON "pages_blocks_embed" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_items_order_idx" ON "pages_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_items_parent_id_idx" ON "pages_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_items_image_idx" ON "pages_blocks_gallery_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_home_slider_order_idx" ON "pages_blocks_home_slider" USING btree ("_order");
  CREATE INDEX "pages_blocks_home_slider_parent_id_idx" ON "pages_blocks_home_slider" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_home_slider_path_idx" ON "pages_blocks_home_slider" USING btree ("_path");
  CREATE INDEX "pages_blocks_container_order_idx" ON "pages_blocks_container" USING btree ("_order");
  CREATE INDEX "pages_blocks_container_parent_id_idx" ON "pages_blocks_container" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_container_path_idx" ON "pages_blocks_container" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_tabs_tabs_order_idx" ON "_pages_v_blocks_form_tabs_tabs" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_form_tabs_tabs_parent_idx" ON "_pages_v_blocks_form_tabs_tabs" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_embed_order_idx" ON "_pages_v_blocks_embed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_embed_parent_id_idx" ON "_pages_v_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_embed_path_idx" ON "_pages_v_blocks_embed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_gallery_items_order_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_items_parent_id_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_items_image_idx" ON "_pages_v_blocks_gallery_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_gallery_order_idx" ON "_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_parent_id_idx" ON "_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_path_idx" ON "_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_home_slider_order_idx" ON "_pages_v_blocks_home_slider" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_home_slider_parent_id_idx" ON "_pages_v_blocks_home_slider" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_home_slider_path_idx" ON "_pages_v_blocks_home_slider" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_container_order_idx" ON "_pages_v_blocks_container" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_container_parent_id_idx" ON "_pages_v_blocks_container" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_container_path_idx" ON "_pages_v_blocks_container" USING btree ("_path");
  CREATE INDEX "news_gallery_order_idx" ON "news_gallery" USING btree ("_order");
  CREATE INDEX "news_gallery_parent_id_idx" ON "news_gallery" USING btree ("_parent_id");
  CREATE INDEX "news_gallery_image_idx" ON "news_gallery" USING btree ("image_id");
  CREATE INDEX "news_gallery_urls_order_idx" ON "news_gallery_urls" USING btree ("_order");
  CREATE INDEX "news_gallery_urls_parent_id_idx" ON "news_gallery_urls" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "news_slug_idx" ON "news" USING btree ("slug");
  CREATE INDEX "news_thumbnail_idx" ON "news" USING btree ("thumbnail_id");
  CREATE INDEX "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
  CREATE INDEX "news__status_idx" ON "news" USING btree ("_status");
  CREATE INDEX "_news_v_version_gallery_order_idx" ON "_news_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_news_v_version_gallery_parent_id_idx" ON "_news_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_news_v_version_gallery_image_idx" ON "_news_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_news_v_version_gallery_urls_order_idx" ON "_news_v_version_gallery_urls" USING btree ("_order");
  CREATE INDEX "_news_v_version_gallery_urls_parent_id_idx" ON "_news_v_version_gallery_urls" USING btree ("_parent_id");
  CREATE INDEX "_news_v_parent_idx" ON "_news_v" USING btree ("parent_id");
  CREATE INDEX "_news_v_version_version_slug_idx" ON "_news_v" USING btree ("version_slug");
  CREATE INDEX "_news_v_version_version_thumbnail_idx" ON "_news_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_news_v_version_version_updated_at_idx" ON "_news_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_v_version_version_created_at_idx" ON "_news_v" USING btree ("version_created_at");
  CREATE INDEX "_news_v_version_version__status_idx" ON "_news_v" USING btree ("version__status");
  CREATE INDEX "_news_v_created_at_idx" ON "_news_v" USING btree ("created_at");
  CREATE INDEX "_news_v_updated_at_idx" ON "_news_v" USING btree ("updated_at");
  CREATE INDEX "_news_v_latest_idx" ON "_news_v" USING btree ("latest");
  CREATE INDEX "_news_v_autosave_idx" ON "_news_v" USING btree ("autosave");
  CREATE INDEX "achievements_image_idx" ON "achievements" USING btree ("image_id");
  CREATE INDEX "achievements_updated_at_idx" ON "achievements" USING btree ("updated_at");
  CREATE INDEX "achievements_created_at_idx" ON "achievements" USING btree ("created_at");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE INDEX "home_slider_slides_order_idx" ON "home_slider_slides" USING btree ("_order");
  CREATE INDEX "home_slider_slides_parent_id_idx" ON "home_slider_slides" USING btree ("_parent_id");
  CREATE INDEX "home_slider_slides_image_idx" ON "home_slider_slides" USING btree ("image_id");
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_achievements_fk" FOREIGN KEY ("achievements_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_image_idx" ON "pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_hero_image_idx" ON "_pages_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_achievements_id_idx" ON "payload_locked_documents_rels" USING btree ("achievements_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_form_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_home_slider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_container" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_form_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_home_slider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_container" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_gallery_urls" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_news_v_version_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_news_v_version_gallery_urls" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_news_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "achievements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "form_submissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_slider_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_slider" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_form_tabs_tabs" CASCADE;
  DROP TABLE "pages_blocks_embed" CASCADE;
  DROP TABLE "pages_blocks_gallery_items" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "pages_blocks_home_slider" CASCADE;
  DROP TABLE "pages_blocks_container" CASCADE;
  DROP TABLE "_pages_v_blocks_form_tabs_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_embed" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_home_slider" CASCADE;
  DROP TABLE "_pages_v_blocks_container" CASCADE;
  DROP TABLE "news_gallery" CASCADE;
  DROP TABLE "news_gallery_urls" CASCADE;
  DROP TABLE "news" CASCADE;
  DROP TABLE "_news_v_version_gallery" CASCADE;
  DROP TABLE "_news_v_version_gallery_urls" CASCADE;
  DROP TABLE "_news_v" CASCADE;
  DROP TABLE "achievements" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "footer_content" CASCADE;
  DROP TABLE "home_slider_slides" CASCADE;
  DROP TABLE "home_slider" CASCADE;
  ALTER TABLE "pages_blocks_hero" DROP CONSTRAINT "pages_blocks_hero_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_hero" DROP CONSTRAINT "_pages_v_blocks_hero_image_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_news_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_achievements_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_form_submissions_fk";
  
  DROP INDEX "pages_blocks_hero_image_idx";
  DROP INDEX "_pages_v_blocks_hero_image_idx";
  DROP INDEX "payload_locked_documents_rels_news_id_idx";
  DROP INDEX "payload_locked_documents_rels_achievements_id_idx";
  DROP INDEX "payload_locked_documents_rels_form_submissions_id_idx";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "image_id";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "image_url";
  ALTER TABLE "pages_blocks_banner" DROP COLUMN "image_url";
  ALTER TABLE "pages_blocks_banner" DROP COLUMN "alt";
  ALTER TABLE "pages_blocks_slider_slides" DROP COLUMN "image_url";
  ALTER TABLE "pages_blocks_slider_slides" DROP COLUMN "alt";
  ALTER TABLE "pages_blocks_image" DROP COLUMN "image_url";
  ALTER TABLE "pages_blocks_image" DROP COLUMN "alt";
  ALTER TABLE "pages_blocks_heading" DROP COLUMN "anchor_id";
  ALTER TABLE "pages_blocks_file_list_items" DROP COLUMN "file_url";
  ALTER TABLE "pages_blocks_file_list_items" DROP COLUMN "file_ext";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "image_id";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "image_url";
  ALTER TABLE "_pages_v_blocks_banner" DROP COLUMN "image_url";
  ALTER TABLE "_pages_v_blocks_banner" DROP COLUMN "alt";
  ALTER TABLE "_pages_v_blocks_slider_slides" DROP COLUMN "image_url";
  ALTER TABLE "_pages_v_blocks_slider_slides" DROP COLUMN "alt";
  ALTER TABLE "_pages_v_blocks_image" DROP COLUMN "image_url";
  ALTER TABLE "_pages_v_blocks_image" DROP COLUMN "alt";
  ALTER TABLE "_pages_v_blocks_heading" DROP COLUMN "anchor_id";
  ALTER TABLE "_pages_v_blocks_file_list_items" DROP COLUMN "file_url";
  ALTER TABLE "_pages_v_blocks_file_list_items" DROP COLUMN "file_ext";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "news_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "achievements_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "form_submissions_id";
  DROP TYPE "public"."enum_pages_blocks_form_tabs_tabs";
  DROP TYPE "public"."enum_pages_blocks_file_list_items_file_ext";
  DROP TYPE "public"."enum_pages_blocks_gallery_source";
  DROP TYPE "public"."enum_pages_blocks_container_columns";
  DROP TYPE "public"."enum__pages_v_blocks_form_tabs_tabs";
  DROP TYPE "public"."enum__pages_v_blocks_file_list_items_file_ext";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_source";
  DROP TYPE "public"."enum__pages_v_blocks_container_columns";
  DROP TYPE "public"."enum_news_status";
  DROP TYPE "public"."enum__news_v_version_status";
  DROP TYPE "public"."enum_form_submissions_form_type";
  DROP TYPE "public"."enum_form_submissions_status";`)
}
