import type { CollectionConfig } from 'payload'

export const AffiliateClicks: CollectionConfig = {
  slug: 'affiliate-clicks',
  admin: {
    useAsTitle: 'clickId',
    group: 'Affiliate Suite',
    defaultColumns: ['clickId', 'network', 'merchant', 'clickref', 'converted', 'commission', 'createdAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'clickId',
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
        { label: 'Direct', value: 'direct' },
      ],
    },
    {
      name: 'merchant',
      type: 'text',
      required: true,
    },
    {
      name: 'clickref',
      type: 'text',
      label: 'SubID / ClickRef',
    },
    {
      name: 'destinationUrl',
      type: 'text',
    },
    {
      name: 'referrer',
      type: 'text',
    },
    {
      name: 'converted',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'commission',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
