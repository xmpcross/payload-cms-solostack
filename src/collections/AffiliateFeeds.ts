import type { CollectionConfig } from 'payload'

export const AffiliateFeeds: CollectionConfig = {
  slug: 'affiliate-feeds',
  admin: {
    useAsTitle: 'feedName',
    group: 'Affiliate Suite',
    defaultColumns: ['feedName', 'network', 'status', 'lastSync', 'addedCount', 'updatedCount', 'failedCount'],
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
        { label: 'CJ Affiliate', value: 'cj' },
        { label: 'Awin Network', value: 'awin' },
        { label: 'Showcase Catalog', value: 'showcase' },
      ],
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
  ],
}
