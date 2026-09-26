import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'

export const Hardware: CollectionConfig = {
  slug: 'hardware',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'manufacturer', 'priceRange'],
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
      name: 'manufacturer',
      type: 'text',
    },
    {
      name: 'retailUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'priceRange',
      type: 'text',
    },
    {
      name: 'specs',
      type: 'array',
      fields: [
        {
          name: 'spec',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'verdict',
      type: 'textarea',
    },
  ],
}
