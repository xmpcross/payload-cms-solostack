import type { CollectionConfig } from 'payload'

export const AffiliateNetworks: CollectionConfig = {
  slug: 'affiliate-networks',
  admin: {
    useAsTitle: 'name',
    group: 'Affiliate Suite',
    defaultColumns: ['name', 'networkType', 'status', 'linkStrategy', 'publisherId', 'updatedAt'],
    components: {
      beforeListTable: ['@/components/admin/AffiliateNetworksHeader#AffiliateNetworksHeader'],
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'networkType',
      type: 'select',
      required: true,
      options: [
        { label: 'CJ Affiliate (Commission Junction)', value: 'cj' },
        { label: 'Awin Network', value: 'awin' },
        { label: 'Takeads Affiliate Network (Mitgo)', value: 'takeads' },
        { label: 'Impact (impact.com / Impact Radius)', value: 'impact' },
        { label: 'Custom Deep Link', value: 'custom' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Connected & Active', value: 'active' },
        { label: 'Inactive / Testing', value: 'inactive' },
        { label: 'Error', value: 'error' },
      ],
    },
    {
      name: 'linkStrategy',
      type: 'select',
      required: true,
      defaultValue: 'append_subid',
      options: [
        { label: 'append_subid (&sid=...)', value: 'append_subid' },
        { label: 'template (URL interpolation)', value: 'template' },
      ],
    },
    {
      name: 'publisherId',
      type: 'text',
      label: 'Publisher ID / Requestor CID / Impact Account SID',
    },
    {
      name: 'websiteId',
      type: 'text',
      label: 'CJ Website ID (PID)',
      admin: {
        description: 'Required by the CJ Link Search API to import coupons. Found under Account → Websites in CJ.',
      },
    },
    {
      name: 'platformId',
      type: 'text',
      label: 'Takeads Platform ID',
      admin: {
        description: 'Used for generating Takeads cookieless affiliate redirect links.',
      },
    },
    {
      name: 'publishKey',
      type: 'text',
      label: 'Takeads Publish Key',
      admin: {
        description: 'Publish Key used alongside Platform ID for link generation.',
      },
    },
    {
      name: 'accountApiKey',
      type: 'text',
      label: 'Account-Level Public Key API (Stats)',
      admin: {
        description: 'Account-level public API key used to pull stats, clicks, and earnings.',
      },
    },
    {
      name: 'apiToken',
      type: 'text',
      label: 'Personal Access Token (PAT) / API Token / Impact Auth Token',
      admin: {
        description: 'Stored securely and used for GraphQL & REST API endpoints.',
      },
    },
    {
      name: 'linkTemplate',
      type: 'text',
      label: 'URL Interpolation Template',
      admin: {
        description: 'For template strategy, e.g. https://www.awin1.com/cread.php?awinmid={merchantId}&awinaffid={publisherId}&ued={destinationUrl}&clickref={clickref}',
      },
    },
    {
      name: 'lastSyncAt',
      type: 'date',
    },
  ],
}
