import type { CollectionConfig } from 'payload'

export const AffiliateCoupons: CollectionConfig = {
  slug: 'affiliate-coupons',
  labels: {
    singular: 'Affiliate Coupon',
    plural: 'All Affiliate Coupons',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Affiliate Suite',
    defaultColumns: ['title', 'storeName', 'siteCategory', 'network', 'code', 'isActive', 'expiryDate'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      // A person changing the category in the admin locks it so imports don't overwrite it.
      ({ data, originalDoc, req, operation }) => {
        if (operation !== 'update' || !req.user || !originalDoc) return data
        const before = typeof originalDoc.siteCategory === 'object' ? originalDoc.siteCategory?.id : originalDoc.siteCategory
        const after = typeof data.siteCategory === 'object' ? data.siteCategory?.id : data.siteCategory
        if (data.siteCategory !== undefined && (before ?? null) !== (after ?? null)) data.siteCategoryLocked = true
        return data
      },
    ],
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
      name: 'siteCategory',
      label: 'Site Category',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        description: 'Set automatically when a coupon is first imported, based on the advertiser sector. Changes you make here are kept on later imports.',
      },
    },
    {
      name: 'siteCategoryLocked',
      label: 'Keep this category on import',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Ticked automatically when you change Site Category by hand. Untick to let imports re-categorise it.',
      },
    },
    {
      name: 'network',
      type: 'select',
      required: true,
      options: [
        { label: 'CJ Affiliate', value: 'cj' },
        { label: 'Awin Network', value: 'awin' },
        { label: 'Takeads', value: 'takeads' },
        { label: 'Direct Merchant', value: 'direct' },
      ],
    },
    {
      name: 'category',
      label: 'Legacy Category',
      type: 'select',
      defaultValue: 'Software & Web Hosting',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        description: 'Old fixed list, kept for existing coupons. Use Site Category instead.',
      },
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
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active Deal / Valid Offer',
    },
    {
      name: 'expiryDate',
      type: 'date',
      label: 'Offer Expiration Date',
    },
    {
      name: 'terms',
      type: 'textarea',
      label: 'Terms & Conditions / Minimum Spend',
    },
    // Set by the feed importer (src/utilities/couponImporter.ts). Empty for manually added coupons.
    {
      name: 'externalId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Network offer ID (e.g. awin:12345). Imported coupons only.',
      },
    },
    {
      name: 'advertiserId',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'advertiserJoined',
      type: 'checkbox',
      label: 'Joined Advertiser (earns commission)',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'startDate',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'lastSeenAt',
      type: 'date',
      label: 'Last Seen in Feed',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
