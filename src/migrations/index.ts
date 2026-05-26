import * as migration_20260419_182714_initial from './20260419_182714_initial';
import * as migration_20260526_214751_add_remote_url_fields from './20260526_214751_add_remote_url_fields';

export const migrations = [
  {
    up: migration_20260419_182714_initial.up,
    down: migration_20260419_182714_initial.down,
    name: '20260419_182714_initial',
  },
  {
    up: migration_20260526_214751_add_remote_url_fields.up,
    down: migration_20260526_214751_add_remote_url_fields.down,
    name: '20260526_214751_add_remote_url_fields'
  },
];
