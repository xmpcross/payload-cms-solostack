import type { Metadata } from 'next'
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { HomePageClient } from './HomePageClient'

export const revalidate = 60 // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: 'SoloStack | Modern Tech Stacks, AI Automation & Hardware for Solo Operators',
  description:
    'Curated blueprints, software tools, hardware reviews, and AI automation guides engineered for 1-person creators, solopreneurs, and remote founders.',
  keywords: [
    'solopreneur tech stack',
    'AI automation pipelines',
    '1-person studio setup',
    'remote workstation ergonomics',
    'software blueprints',
    'solopreneur tools',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SoloStack | Tech Stacks, AI Automation & Hardware for Solo Operators',
    description:
      'Curated blueprints, software tools, hardware reviews, and AI automation guides engineered for 1-person creators, solopreneurs, and remote founders.',
    url: 'https://solostack.au',
    siteName: 'SoloStack CMS',
    images: [
      {
        url: '/media/solo-creator-4k-editing-pipeline.webp',
        width: 1200,
        height: 630,
        alt: 'SoloStack Modern Blueprint Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SoloStack | Tech Stacks & AI Automation for Solo Operators',
    description:
      'Curated blueprints, software tools, hardware reviews, and AI automation guides engineered for 1-person creators, solopreneurs, and remote founders.',
    images: ['/media/solo-creator-4k-editing-pipeline.webp'],
  },
}

export default async function HomePage() {
  let categories: any[] = []
  let posts: any[] = []
  let stacks: any[] = []
  let tools: any[] = []
  let hardware: any[] = []

  try {
    const payload = await getPayload({ config: configPromise })

    // Fetch Categories
    const categoriesRes = await payload.find({
      collection: 'categories',
      limit: 100,
      overrideAccess: true,
    })
    categories = categoriesRes.docs || []

    // Fetch Published Posts
    const postsRes = await payload.find({
      collection: 'posts',
      draft: false,
      limit: 100,
      overrideAccess: true,
      sort: '-publishedAt',
    })
    posts = postsRes.docs || []

    // Fetch Stacks
    const stacksRes = await payload.find({
      collection: 'stacks',
      limit: 10,
      overrideAccess: true,
    })
    stacks = stacksRes.docs || []

    // Fetch Tools
    const toolsRes = await payload.find({
      collection: 'tools',
      limit: 10,
      overrideAccess: true,
    })
    tools = toolsRes.docs || []

    // Fetch Hardware
    const hardwareRes = await payload.find({
      collection: 'hardware',
      limit: 10,
      overrideAccess: true,
    })
    hardware = hardwareRes.docs || []
  } catch (err) {
    console.warn('Error fetching homepage payload data:', err)
  }

  // Generate JSON-LD Structured Data Schema for SEO
  const jsonLdWebSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SoloStack CMS',
    url: 'https://solostack.au',
    description:
      'Curated blueprints, software tools, hardware reviews, and AI automation guides engineered for 1-person creators, solopreneurs, and remote founders.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://solostack.au/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  const jsonLdOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SoloStack',
    url: 'https://solostack.au',
    logo: 'https://solostack.au/favicon.svg',
    sameAs: ['https://twitter.com/solostack'],
  }

  const jsonLdItemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'SoloStack Articles & Field Manuals',
    itemListElement: posts.map((post, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: post.title,
      url: `https://solostack.au/posts/${post.slug}`,
    })),
  }

  return (
    <>
      {/* Structured SEO Data injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
      />

      <HomePageClient
        categories={categories}
        posts={posts}
        stacks={stacks}
        tools={tools}
        hardware={hardware}
      />
    </>
  )
}
