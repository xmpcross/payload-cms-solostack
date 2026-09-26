import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { payloadAiPlugin } from '@ai-stack/payloadcms'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Website Template` : 'Payload Website Template'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  payloadAiPlugin({
    collections: {
      pages: true,
      posts: true,
      tools: true,
      hardware: true,
      stacks: true,
      comparisons: true,
      'affiliate-coupons': true,
    },
    // Direct AI-generated images into the Media collection
    uploadCollectionSlug: 'media',

    // Lock down AI generation and settings to authenticated admins
    access: {
      generate: ({ req }) => Boolean(req.user),
      settings: ({ req }) => Boolean(req.user),
    },

    // Silence large terminal banner on every startup/build
    disableSponsorMessage: true,

    // Avoid redundant schema prompt seeding on production boot
    generatePromptOnInit: process.env.NODE_ENV !== 'production',

    // Configure providers
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
      },
      ...(process.env.ANTHROPIC_API_KEY ? { anthropic: { apiKey: process.env.ANTHROPIC_API_KEY } } : {}),
      ...(process.env.GOOGLE_GENERATIVE_AI_API_KEY ? { google: { apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY } } : {}),
      ...(process.env.ELEVENLABS_API_KEY ? { elevenLabs: { apiKey: process.env.ELEVENLABS_API_KEY } } : {}),
    },

    // Skip technical fields and provide smart SEO prompt templates
    seedPrompts: ({ path }) => {
      if (path.endsWith('.slug') || path.endsWith('.id')) return false
      if (path.endsWith('.meta.description')) {
        return {
          data: {
            prompt: 'Generate an SEO-optimized meta description under 155 characters that summarizes: {{ title }}',
          },
        }
      }
      return undefined
    },

    // Expose Compose Settings under Settings group in Admin UI
    overrideInstructions: {
      admin: {
        group: 'Settings',
        hidden: false,
      },
    },
  }),
]
