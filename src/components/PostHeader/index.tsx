import React from 'react'
import Link from 'next/link'
import type { Post } from '@/payload-types'
import { Media } from '@/components/Media'
import { ShareButton } from '@/components/ShareButton'

interface PostHeaderProps {
  post: Post
  readingTime?: number
}

export const PostHeader: React.FC<PostHeaderProps> = ({ post, readingTime = 5 }) => {
  const { title, categories, populatedAuthors, publishedAt, heroImage, meta } = post

  const category = categories && categories.length > 0 && typeof categories[0] === 'object' ? categories[0] : null
  const categoryTitle = category?.title || 'Guides'
  const categorySlug = category?.slug || 'posts'

  const author = populatedAuthors && populatedAuthors.length > 0 ? populatedAuthors[0] : null
  const authorName = author?.name || 'SoloStack Lab'
  const authorInitial = authorName.charAt(0).toUpperCase()

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent'

  const subtitle = meta?.description || ''

  return (
    <header className="single-header container mt-8 lg:mt-12">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">/</li>
            <li>
              <Link href="/posts" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Articles
              </Link>
            </li>
            {category && (
              <>
                <li aria-hidden="true" className="text-neutral-400">/</li>
                <li>
                  <Link
                    href={`/posts?category=${categorySlug}`}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {categoryTitle}
                  </Link>
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Category Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
          {category && (
            <Link
              href={`/posts?category=${categorySlug}`}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100 transition-colors"
            >
              {categoryTitle}
            </Link>
          )}
          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-border">
            Guide
          </span>
        </div>

        {/* H1 Title */}
        <h1 className="max-w-4xl text-3xl/tight sm:text-4xl/tight lg:text-[2.65rem]/tight font-bold tracking-tight text-neutral-900 dark:text-white">
          {title}
        </h1>

        {/* Subtitle / Description */}
        {subtitle && (
          <p className="text-base/relaxed sm:text-lg/relaxed text-neutral-600 dark:text-neutral-300">
            {subtitle}
          </p>
        )}

        <hr className="w-full border-t border-border" />

        {/* Author & Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              {authorInitial}
            </div>
            <div>
              <p className="font-semibold text-sm text-neutral-900 dark:text-white leading-tight">
                {authorName}
              </p>
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                <time dateTime={publishedAt || ''}>{formattedDate}</time>
                <span>&bull;</span>
                <span>{readingTime} min read</span>
              </div>
            </div>
          </div>

          <div className="ms-auto">
            <ShareButton title={title} />
          </div>
        </div>

        {/* Featured Image */}
        {heroImage && typeof heroImage === 'object' && (
          <div className="relative mt-8 sm:mt-10 overflow-hidden rounded-2xl border border-border shadow-sm bg-neutral-100 dark:bg-neutral-800">
            <div className="aspect-16/9 w-full">
              <Media
                resource={heroImage}
                priority
                className="size-full object-cover"
                imgClassName="size-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
