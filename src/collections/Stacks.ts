import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'

export const Stacks: CollectionConfig = {
  slug: 'stacks',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'businessModel', 'monthlySoftwareCost'],
  },
  fields: [
    {
      name: 'title',
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
      name: 'businessModel',
      type: 'select',
      options: [
        { label: 'Agency / Solopreneur', value: 'agency' },
        { label: 'Creator / Media Studio', value: 'creator' },
        { label: 'Paid Newsletter', value: 'newsletter' },
        { label: 'Lean SaaS Founder', value: 'saas' },
        { label: 'Remote Consultant', value: 'consultant' },
      ],
      defaultValue: 'creator',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'tools',
      type: 'relationship',
      relationTo: 'tools',
      hasMany: true,
    },
    {
      name: 'hardware',
      type: 'relationship',
      relationTo: 'hardware',
      hasMany: true,
    },
    {
      name: 'monthlySoftwareCost',
      type: 'text',
    },
    {
      name: 'detailedWorkflow',
      type: 'richText',
    },
  ],
}
