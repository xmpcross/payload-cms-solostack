import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'

export const Comparisons: CollectionConfig = {
  slug: 'comparisons',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'winner'],
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
      name: 'toolA',
      type: 'relationship',
      relationTo: 'tools',
      required: true,
    },
    {
      name: 'toolB',
      type: 'relationship',
      relationTo: 'tools',
      required: true,
    },
    {
      name: 'winner',
      type: 'select',
      options: [
        { label: 'Tool A', value: 'toolA' },
        { label: 'Tool B', value: 'toolB' },
        { label: 'Tie / Context Dependent', value: 'tie' },
      ],
      defaultValue: 'tie',
    },
    {
      name: 'verdictSummary',
      type: 'textarea',
    },
    {
      name: 'detailedBreakdown',
      type: 'richText',
    },
  ],
}
