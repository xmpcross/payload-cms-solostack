import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { TableOfContents } from '@/components/TableOfContents'
import { AuthorBio } from '@/components/AuthorBio'
import { PostSidebar } from '@/components/PostSidebar'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'posts',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
    })

    const params = posts.docs.map(({ slug }) => {
      return { slug }
    })

    return params
  } catch (error) {
    console.warn('Database unavailable during SSG build for posts/[slug]:', error)
    return []
  }
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

function extractHeadingsAndWordCount(content: any): {
  tocItems: { id: string; text: string }[]
  wordCount: number
} {
  const tocItems: { id: string; text: string }[] = []
  let wordCount = 0

  function extractText(node: any): string {
    if (!node) return ''
    if (node.type === 'text' && typeof node.text === 'string') return node.text
    if (Array.isArray(node.children)) {
      return node.children.map(extractText).join('')
    }
    return ''
  }

  function traverse(node: any) {
    if (!node) return

    if (node.type === 'heading' && node.tag === 'h2') {
      const text = extractText(node).trim()
      if (text) {
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        tocItems.push({ id, text })
      }
    }

    if (node.type === 'text' && typeof node.text === 'string') {
      const words = node.text.trim().split(/\s+/).filter(Boolean)
      wordCount += words.length
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child)
      }
    }
  }

  if (content?.root) {
    traverse(content.root)
  }

  return { tocItems, wordCount }
}

export default async function PostPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  const { tocItems, wordCount } = extractHeadingsAndWordCount(post.content)
  const readingTime = Math.max(1, Math.ceil(wordCount / 220))

  // Fetch sidebar data: popular guides & categories
  let popularPosts: any[] = []
  let categories: any[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const [postsRes, catsRes] = await Promise.all([
      payload.find({
        collection: 'posts',
        limit: 5,
        sort: '-publishedAt',
        overrideAccess: false,
        where: {
          slug: {
            not_equals: decodedSlug,
          },
        },
        select: {
          title: true,
          slug: true,
          publishedAt: true,
          heroImage: true,
        },
      }),
      payload.find({
        collection: 'categories',
        limit: 8,
        overrideAccess: false,
        select: {
          title: true,
          slug: true,
        },
      }),
    ])

    popularPosts = postsRes.docs
    categories = catsRes.docs
  } catch (error) {
    console.warn('Sidebar data fetch error:', error)
  }

  return (
    <article className="pt-6 pb-20">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      {/* Editorial Header matching reference design */}
      <PostHero post={post} readingTime={readingTime} />

      {/* 2-Column Content + Sticky Sidebar Layout */}
      <div className="container mt-12 flex flex-col lg:flex-row gap-10 xl:gap-14">
        {/* Main Article Column (60% lg / 66% xl) */}
        <div className="w-full lg:w-3/5 xl:w-2/3 xl:pe-6">
          {/* The Short Answer / Quick Verdict Callout Box */}
          {post.meta?.description && (
            <div className="mb-8 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 p-6 sm:p-7 shadow-2xs">
              <p className="text-xs font-bold tracking-wider text-emerald-800 dark:text-emerald-400 uppercase">
                The Short Answer
              </p>
              <p className="mt-2 text-base leading-relaxed text-neutral-800 dark:text-neutral-200 font-medium">
                {post.meta.description}
              </p>
            </div>
          )}

          {/* Table of Contents */}
          {tocItems.length > 0 && <TableOfContents items={tocItems} />}

          {/* Article RichText Content */}
          <div className="article-body">
            <RichText data={post.content} enableGutter={false} />
          </div>

          {/* Author Bio Box */}
          <AuthorBio
            authorName={
              post.populatedAuthors && post.populatedAuthors.length > 0 && post.populatedAuthors[0].name
                ? post.populatedAuthors[0].name
                : 'SoloStack Editorial Lab'
            }
          />

          {/* Related Posts Section (if defined) */}
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-xl font-bold mb-6 text-neutral-900 dark:text-white">
                Related Guides &amp; Stacks
              </h3>
              <RelatedPosts
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                docs={post.relatedPosts.filter((post) => typeof post === 'object')}
              />
            </div>
          )}
        </div>

        {/* Sticky Sidebar (40% lg / 33% xl) */}
        <PostSidebar popularPosts={popularPosts} categories={categories} />
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  try {
    const { isEnabled: draft } = await draftMode()

    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'posts',
      draft,
      limit: 1,
      overrideAccess: draft,
      pagination: false,
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    return result.docs?.[0] || null
  } catch (error) {
    console.warn('Database query error for post slug:', slug, error)
    return null
  }
})
