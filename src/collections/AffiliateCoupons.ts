import type { CollectionConfig } from 'payload'

export const AffiliateCoupons: CollectionConfig = {
  slug: 'affiliate-coupons',
  admin: {
    useAsTitle: 'title',
    group: 'Affiliate Suite',
    defaultColumns: ['title', 'storeName', 'network', 'code', 'clicks', 'commissions', 'grossCommission'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'storeName',
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
        { label: 'Direct Merchant', value: 'direct' },
      ],
    },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'Software & Web Hosting',
      options: [
        { label: 'Fashion & Apparel', value: 'Fashion & Apparel' },
        { label: 'Electronics & Tech', value: 'Electronics & Tech' },
        { label: 'Software & Web Hosting', value: 'Software & Web Hosting' },
        { label: 'Travel & Booking', value: 'Travel & Booking' },
        { label: 'Beauty & Personal Care', value: 'Beauty & Personal Care' },
      ],
    },
    {
      name: 'code',
      type: 'text',
      label: 'Voucher / Promo Code',
    },
    {
      name: 'discountText',
      type: 'text',
    },
    {
      name: 'destinationUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'affiliateUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'clicks',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'commissions',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'epc',
      type: 'number',
      defaultValue: 0.0,
      label: 'Earnings Per Click (EPC)',
    },
    {
      name: 'grossCommission',
      type: 'number',
      defaultValue: 0.0,
    },
  ],
}
