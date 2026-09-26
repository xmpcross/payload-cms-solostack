import React from 'react'
import Link from 'next/link'
import { ArrowUpRight, Sparkles, Tag, Flame, ShieldCheck } from 'lucide-react'
import type { Category, Post } from '@/payload-types'
import { Media } from '@/components/Media'

interface PostSidebarProps {
  popularPosts?: Post[]
  categories?: Category[]
}

export const PostSidebar: React.FC<PostSidebarProps> = ({
  popularPosts = [],
  categories = [],
}) => {
  return (
    <aside className="w-full lg:w-2/5 xl:w-1/3 shrink-0">
      <div className="space-y-8 lg:sticky lg:top-8">
        {/* Widget 1: Popular / Trending Posts */}
        {popularPosts.length > 0 && (
          <div className="widget-posts overflow-hidden rounded-3xl border border-border bg-neutral-50/80 dark:bg-card shadow-2xs">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 text-neutral-900 dark:text-white">
                <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Popular guides
              </h3>
              <Link
                href="/posts"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {popularPosts.slice(0, 5).map((post) => {
                const dateStr = post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent'

                return (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="group flex items-center justify-between gap-4 p-4 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
                  >
                    <div className="grow space-y-1.5 min-w-0">
                      <h4 className="text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {dateStr}
                      </p>
                    </div>
                    {post.heroImage && typeof post.heroImage === 'object' && (
                      <div className="relative aspect-square w-18 h-18 shrink-0 overflow-hidden rounded-xl border border-border">
                        <Media
                          resource={post.heroImage}
                          className="size-full object-cover"
                          imgClassName="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          size="thumbnail"
                        />
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Widget 2: Deals & Software Discounts Callout */}
        <div className="widget-deals rounded-3xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Verified Partner Deals</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
            Save up to 70% on Solopreneur Software &amp; Workstations
          </h3>
          <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
            Exclusive reader discounts on Riverside.fm, Descript, NordVPN, Canva Pro, and ergonomics gear.
          </p>
          <Link
            href="/deals"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2.5 px-4 transition-colors shadow-xs"
          >
            <span>Browse All Deals</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Widget 3: Suggested Topics / Categories */}
        {categories.length > 0 && (
          <div className="widget-categories rounded-3xl border border-border bg-neutral-50/80 dark:bg-card p-6 space-y-4 shadow-2xs">
            <h3 className="font-bold text-base flex items-center gap-2 text-neutral-900 dark:text-white">
              <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Suggested topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/posts?category=${cat.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border border-border bg-white dark:bg-neutral-800 text-neutral-700 hover:border-emerald-500 hover:text-emerald-600 dark:text-neutral-300 dark:hover:text-emerald-400 transition-colors"
                >
                  <span>{cat.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Widget 4: Newsletter / Dispatch */}
        <div className="widget-newsletter rounded-3xl border border-border bg-neutral-50/80 dark:bg-card p-6 space-y-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Weekly Blueprint</span>
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
            SoloStack Dispatch
          </h3>
          <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
            Get zero-headcount system blueprints, tool evaluations, and revenue teardowns delivered weekly.
          </p>
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full text-xs rounded-xl border border-border bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-emerald-500"
            />
            <button
              type="button"
              className="w-full rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-semibold text-xs py-2.5 transition-colors"
            >
              Subscribe Free
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
