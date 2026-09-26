import * as migration_20260926_172653_init_affiliate_and_ai from './20260926_172653_init_affiliate_and_ai';

export const migrations = [
  {
    up: migration_20260926_172653_init_affiliate_and_ai.up,
    down: migration_20260926_172653_init_affiliate_and_ai.down,
    name: '20260926_172653_init_affiliate_and_ai'
  },
];
