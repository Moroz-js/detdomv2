import * as migration_20260419_182714_initial from './20260419_182714_initial';
import * as migration_20260526_214751_add_remote_url_fields from './20260526_214751_add_remote_url_fields';
import * as migration_20260701_172526_add_image_block_size_fields from './20260701_172526_add_image_block_size_fields';
import * as migration_20260722_214322_add_video_block from './20260722_214322_add_video_block';

export const migrations = [
  {
    up: migration_20260419_182714_initial.up,
    down: migration_20260419_182714_initial.down,
    name: '20260419_182714_initial',
  },
  {
    up: migration_20260526_214751_add_remote_url_fields.up,
    down: migration_20260526_214751_add_remote_url_fields.down,
    name: '20260526_214751_add_remote_url_fields',
  },
  {
    up: migration_20260701_172526_add_image_block_size_fields.up,
    down: migration_20260701_172526_add_image_block_size_fields.down,
    name: '20260701_172526_add_image_block_size_fields',
  },
  {
    up: migration_20260722_214322_add_video_block.up,
    down: migration_20260722_214322_add_video_block.down,
    name: '20260722_214322_add_video_block'
  },
];
