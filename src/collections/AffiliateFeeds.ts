import type { CollectionConfig } from 'payload'

export const AffiliateFeeds: CollectionConfig = {
  slug: 'affiliate-feeds',
  labels: {
    singular: 'Affiliate Feed',
    plural: 'All Advertiser Feeds',
  },
  admin: {
    useAsTitle: 'feedName',
    group: 'Affiliate Suite',
    defaultColumns: ['feedName', 'network', 'feedType', 'status', 'advertiserScope', 'lastSync', 'addedCount', 'updatedCount', 'failedCount'],
    components: {
      beforeListTable: ['@/components/admin/AffiliateFeedsHeader#AffiliateFeedsHeader'],
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'feedName',
      type: 'text',
      required: true,
    },
    {
      name: 'network',
      type: 'select',
      required: true,
      options: [
        { label: 'All Advertisers (Global Feed)', value: 'all_advertisers' },
        { label: 'CJ Affiliate', value: 'cj' },
        { label: 'Awin Network', value: 'awin' },
        { label: 'Takeads Feed', value: 'takeads' },
        { label: 'Showcase Catalog', value: 'showcase' },
        { label: 'Impact Radius', value: 'impact' },
        { label: 'Rakuten Advertising', value: 'rakuten' },
        { label: 'Direct Merchant Feed', value: 'direct' },
      ],
    },
    {
      name: 'advertiserScope',
      type: 'select',
      defaultValue: 'all_advertisers',
      options: [
        { label: 'All Advertisers (Value-First Mode / Unrestricted)', value: 'all_advertisers' },
        { label: 'Approved Affiliate Partners Only', value: 'approved_only' },
      ],
      admin: {
        description: 'Value-First Mode displays coupons, vouchers, and product feeds from all advertisers regardless of affiliate partnership stage.',
      },
    },
    {
      name: 'feedType',
      label: 'Feed Type',
      type: 'select',
      required: true,
      defaultValue: 'coupons',
      options: [
        { label: 'Coupons & Promo Codes', value: 'coupons' },
        { label: 'Product Feed', value: 'products' },
        { label: 'Legacy Combined (Coupons + Products)', value: 'all_content' },
      ],
      admin: {
        description: 'Each affiliate provider keeps its Coupons feed and Product Feed as separate records.',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'ACTIVE',
      options: [
        { label: 'ACTIVE', value: 'ACTIVE' },
        { label: 'PAUSED', value: 'PAUSED' },
        { label: 'SYNCING', value: 'SYNCING' },
        { label: 'ERROR', value: 'ERROR' },
      ],
    },
    {
      name: 'lastSync',
      type: 'date',
    },
    {
      name: 'addedCount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'updatedCount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'skippedCount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'failedCount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'siteCategoriesOnly',
      type: 'checkbox',
      label: 'Only import advertisers matching site categories',
      defaultValue: true,
      admin: {
        description:
          'Matches each advertiser\'s network sector/category against the keywords on each Category. Non-matching advertisers are skipped.',
      },
    },
    {
      name: 'regions',
      type: 'text',
      label: 'Target Countries',
      defaultValue: 'US',
      admin: {
        description: 'ISO country codes, comma separated (e.g. US or US, GB, CA). Only offers valid in these countries are imported. Leave empty for all countries.',
      },
    },
    {
      name: 'includeAdvertisers',
      type: 'textarea',
      label: 'Always Include Advertisers',
      admin: { description: 'Advertiser IDs or exact names, comma or line separated. Imported even if no category matches.' },
    },
    {
      name: 'excludeAdvertisers',
      type: 'textarea',
      label: 'Always Exclude Advertisers',
      admin: { description: 'Advertiser IDs or exact names, comma or line separated.' },
    },
    {
      name: 'excludeKeywords',
      type: 'textarea',
      label: 'Exclude Keywords',
      defaultValue: 'casino, gambling, betting, adult, dating, cbd, vape, tobacco, payday loan',
      admin: { description: 'Offers whose title, terms or advertiser name contain any of these words are skipped.' },
    },
    {
      name: 'lastError',
      type: 'textarea',
      admin: { readOnly: true },
    },
  ],
}
