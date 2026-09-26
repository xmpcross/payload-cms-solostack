import * as migration_20260926_172653_init_affiliate_and_ai from './20260926_172653_init_affiliate_and_ai';
import * as migration_20260926_204830_add_faq_block from './20260926_204830_add_faq_block';

export const migrations = [
  {
    up: migration_20260926_172653_init_affiliate_and_ai.up,
    down: migration_20260926_172653_init_affiliate_and_ai.down,
    name: '20260926_172653_init_affiliate_and_ai',
  },
  {
    up: migration_20260926_204830_add_faq_block.up,
    down: migration_20260926_204830_add_faq_block.down,
    name: '20260926_204830_add_faq_block'
  },
];
