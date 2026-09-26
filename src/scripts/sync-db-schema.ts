import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

async function syncDbSchema() {
  console.log('Initializing Payload DB adapter to trigger schema creation/sync...')
  try {
    const payload = await getPayload({ config: configPromise })
    console.log('Payload initialized successfully!')

    // Create tables via direct SQL if missing
    if (payload.db.pool) {
      await payload.db.pool.query(`
        CREATE TABLE IF NOT EXISTS affiliate_networks (
          id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          network_type VARCHAR NOT NULL,
          status VARCHAR DEFAULT 'active',
          link_strategy VARCHAR NOT NULL DEFAULT 'append_subid',
          publisher_id VARCHAR,
          api_token VARCHAR,
          link_template VARCHAR,
          last_sync_at TIMESTAMP WITH TIME ZONE,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS affiliate_feeds (
          id SERIAL PRIMARY KEY,
          feed_name VARCHAR NOT NULL,
          network VARCHAR NOT NULL,
          status VARCHAR DEFAULT 'ACTIVE',
          last_sync TIMESTAMP WITH TIME ZONE,
          added_count NUMERIC DEFAULT 0,
          updated_count NUMERIC DEFAULT 0,
          skipped_count NUMERIC DEFAULT 0,
          failed_count NUMERIC DEFAULT 0,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS affiliate_coupons (
          id SERIAL PRIMARY KEY,
          title VARCHAR NOT NULL,
          store_name VARCHAR NOT NULL,
          network VARCHAR NOT NULL,
          category VARCHAR DEFAULT 'Software & Web Hosting',
          code VARCHAR,
          discount_text VARCHAR,
          destination_url VARCHAR NOT NULL,
          affiliate_url VARCHAR NOT NULL,
          clicks NUMERIC DEFAULT 0,
          commissions NUMERIC DEFAULT 0,
          epc NUMERIC DEFAULT 0,
          gross_commission NUMERIC DEFAULT 0,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS affiliate_clicks (
          id SERIAL PRIMARY KEY,
          click_id VARCHAR NOT NULL,
          network VARCHAR NOT NULL,
          merchant VARCHAR NOT NULL,
          clickref VARCHAR,
          destination_url VARCHAR,
          referrer VARCHAR,
          converted BOOLEAN DEFAULT FALSE,
          commission NUMERIC DEFAULT 0,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS plugin_ai_instructions (
          id SERIAL PRIMARY KEY,
          schema_path VARCHAR,
          field_type VARCHAR,
          prompt VARCHAR,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add relationship columns to payload_locked_documents_rels
        ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS affiliate_networks_id INTEGER REFERENCES affiliate_networks(id) ON DELETE CASCADE;
        ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS affiliate_feeds_id INTEGER REFERENCES affiliate_feeds(id) ON DELETE CASCADE;
        ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS affiliate_coupons_id INTEGER REFERENCES affiliate_coupons(id) ON DELETE CASCADE;
        ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS affiliate_clicks_id INTEGER REFERENCES affiliate_clicks(id) ON DELETE CASCADE;
        ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS plugin_ai_instructions_id INTEGER REFERENCES plugin_ai_instructions(id) ON DELETE CASCADE;

        -- Add relationship columns to payload_preferences_rels
        ALTER TABLE payload_preferences_rels ADD COLUMN IF NOT EXISTS affiliate_networks_id INTEGER REFERENCES affiliate_networks(id) ON DELETE CASCADE;
        ALTER TABLE payload_preferences_rels ADD COLUMN IF NOT EXISTS affiliate_feeds_id INTEGER REFERENCES affiliate_feeds(id) ON DELETE CASCADE;
        ALTER TABLE payload_preferences_rels ADD COLUMN IF NOT EXISTS affiliate_coupons_id INTEGER REFERENCES affiliate_coupons(id) ON DELETE CASCADE;
        ALTER TABLE payload_preferences_rels ADD COLUMN IF NOT EXISTS affiliate_clicks_id INTEGER REFERENCES affiliate_clicks(id) ON DELETE CASCADE;
        ALTER TABLE payload_preferences_rels ADD COLUMN IF NOT EXISTS plugin_ai_instructions_id INTEGER REFERENCES plugin_ai_instructions(id) ON DELETE CASCADE;
      `)
      console.log('Postgres DB schema tables & relationship columns created successfully!')
    }

    process.exit(0)
  } catch (error) {
    console.error('Schema sync error:', error)
    process.exit(1)
  }
}

syncDbSchema()
