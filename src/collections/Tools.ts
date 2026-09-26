import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'

export const Tools: CollectionConfig = {
  slug: 'tools',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'pricingType', 'startingPrice', 'rating'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'tagline',
      type: 'text',
    },
    {
      name: 'pricingType',
      type: 'select',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Freemium', value: 'freemium' },
        { label: 'Paid', value: 'paid' },
      ],
      defaultValue: 'freemium',
    },
    {
      name: 'startingPrice',
      type: 'text',
    },
    {
      name: 'affiliateUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      defaultValue: 5,
    },
    {
      name: 'pros',
      type: 'array',
      fields: [
        {
          name: 'pro',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'cons',
      type: 'array',
      fields: [
        {
          name: 'con',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
    },
  ],
}
