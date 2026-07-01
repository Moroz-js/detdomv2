import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_image_width" AS ENUM('auto', '1/3', '1/2', '2/3', 'full');
  CREATE TYPE "public"."enum_pages_blocks_image_max_height" AS ENUM('sm', 'md', 'lg', 'xl', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_image_width" AS ENUM('auto', '1/3', '1/2', '2/3', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_image_max_height" AS ENUM('sm', 'md', 'lg', 'xl', 'none');
  ALTER TABLE "pages_blocks_image" ADD COLUMN "width" "enum_pages_blocks_image_width" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_image" ADD COLUMN "max_height" "enum_pages_blocks_image_max_height" DEFAULT 'md';
  ALTER TABLE "_pages_v_blocks_image" ADD COLUMN "width" "enum__pages_v_blocks_image_width" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_image" ADD COLUMN "max_height" "enum__pages_v_blocks_image_max_height" DEFAULT 'md';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_image" DROP COLUMN "width";
  ALTER TABLE "pages_blocks_image" DROP COLUMN "max_height";
  ALTER TABLE "_pages_v_blocks_image" DROP COLUMN "width";
  ALTER TABLE "_pages_v_blocks_image" DROP COLUMN "max_height";
  DROP TYPE "public"."enum_pages_blocks_image_width";
  DROP TYPE "public"."enum_pages_blocks_image_max_height";
  DROP TYPE "public"."enum__pages_v_blocks_image_width";
  DROP TYPE "public"."enum__pages_v_blocks_image_max_height";`)
}
