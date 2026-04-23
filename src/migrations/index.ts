import * as migration_20260419_182714_initial from './20260419_182714_initial';

export const migrations = [
  {
    up: migration_20260419_182714_initial.up,
    down: migration_20260419_182714_initial.down,
    name: '20260419_182714_initial'
  },
];
