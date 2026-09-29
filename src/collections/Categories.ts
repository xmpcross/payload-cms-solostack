import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
    {
      name: 'affiliateKeywords',
      type: 'textarea',
      label: 'Affiliate Sector Keywords',
      admin: {
        description:
          'Comma-separated. Imported coupons/products are assigned to this category when the advertiser sector or name matches one of these words. Leave empty to use the built-in defaults.',
      },
    },
  ],
}
