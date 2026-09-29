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
    defaultColumns: ['title', 'postCount', 'slug'],
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
      // Not stored: counted from Posts each time the category is read.
      name: 'postCount',
      label: 'Posts',
      type: 'number',
      virtual: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Number of posts (published and draft) in this category.',
      },
      hooks: {
        afterRead: [
          async ({ data, req }) => {
            if (!data?.id) return 0
            const { totalDocs } = await req.payload.count({
              collection: 'posts',
              where: { categories: { in: [data.id] } },
              req,
            })
            return totalDocs
          },
        ],
      },
    },
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
