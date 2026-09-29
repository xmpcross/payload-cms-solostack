'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'

import { Card, CardPostData } from '@/components/Card'

export type ArchivePost = CardPostData & { id: string | number; publishedAt?: string | null }

// Posts rendered at first, and added per click of "Show more".
const PAGE_SIZE = 12

const categoriesOf = (post: ArchivePost) =>
  (post.categories || []).filter((c): c is Exclude<typeof c, number> => typeof c === 'object' && c !== null)

function OptionRow({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-left text-sm transition-colors cursor-pointer ${
        active ? 'bg-primary text-primary-foreground font-semibold' : 'text-foreground/80 hover:bg-muted'
      }`}
    >
      <span className="truncate">{label}</span>
      <span className={`text-xs tabular-nums ${active ? 'opacity-80' : 'text-muted-foreground'}`}>{count}</span>
    </button>
  )
}

export function PostsArchive({ posts }: { posts: ArchivePost[] }) {
  const searchParams = useSearchParams()
  const [category, setCategory] = useState<string>(searchParams.get('category') || 'all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'title'>('newest')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const categories = useMemo(() => {
    const map = new Map<string, { title: string; slug: string; count: number }>()
    for (const post of posts) {
      for (const c of categoriesOf(post)) {
        if (!c.slug || !c.title) continue
        const entry = map.get(c.slug) || { title: c.title, slug: c.slug, count: 0 }
        entry.count++
        map.set(c.slug, entry)
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
  }, [posts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = posts.filter((post) => {
      if (category !== 'all' && !categoriesOf(post).some((c) => c.slug === category)) return false
      if (!q) return true
      return (
        post.title?.toLowerCase().includes(q) ||
        post.meta?.description?.toLowerCase().includes(q) ||
        categoriesOf(post).some((c) => c.title?.toLowerCase().includes(q))
      )
    })
    const time = (p: ArchivePost) => (p.publishedAt ? new Date(p.publishedAt).getTime() : 0)
    return [...list].sort((a, b) =>
      sort === 'title' ? (a.title || '').localeCompare(b.title || '') : sort === 'oldest' ? time(a) - time(b) : time(b) - time(a),
    )
  }, [posts, category, query, sort])

  useEffect(() => setVisible(PAGE_SIZE), [category, query, sort])

  // Keep the URL shareable: /posts?category=<slug>
  const chooseCategory = (slug: string) => {
    setCategory(slug)
    const url = new URL(window.location.href)
    if (slug === 'all') url.searchParams.delete('category')
    else url.searchParams.set('category', slug)
    window.history.replaceState(null, '', url)
  }

  const activeFilters = (category !== 'all' ? 1 : 0) + (query.trim() ? 1 : 0)
  const clearAll = () => {
    chooseCategory('all')
    setQuery('')
  }
  const shown = filtered.slice(0, visible)
  const activeCategory = categories.find((c) => c.slug === category)

  const sidebar = (
    <div className="rounded-xl border border-border bg-card p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-bold">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </h2>
        {activeFilters > 0 && (
          <button type="button" onClick={clearAll} className="text-xs font-semibold text-primary hover:underline underline-offset-4 cursor-pointer">
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Search</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles..."
            aria-label="Search articles"
            className="w-full pl-8 pr-2 h-9 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Category</h3>
        <OptionRow label="All articles" count={posts.length} active={category === 'all'} onClick={() => chooseCategory('all')} />
        {categories.map((c) => (
          <OptionRow key={c.slug} label={c.title} count={c.count} active={category === c.slug} onClick={() => chooseCategory(c.slug)} />
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sort by</h3>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label="Sort articles"
          className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title A–Z</option>
        </select>
      </div>
    </div>
  )

  return (
    <div className="container grid grid-cols-1 lg:grid-cols-[17rem_minmax(0,1fr)] gap-8 items-start">
      <aside className="lg:sticky lg:top-24">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          className="lg:hidden w-full flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-4 w-4" />
            Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
          </span>
          <span className="text-xs font-medium text-muted-foreground">{filtersOpen ? 'Hide' : 'Show'}</span>
        </button>
        <div className={`${filtersOpen ? 'block mt-3' : 'hidden'} lg:block`}>{sidebar}</div>
      </aside>

      <div className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{shown.length}</strong> of {filtered.length} articles
          </span>
          {activeCategory && (
            <button
              type="button"
              onClick={() => chooseCategory('all')}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground cursor-pointer"
            >
              {activeCategory.title}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {shown.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {shown.map((post) => (
                <Card key={post.id} className="h-full" doc={post} relationTo="posts" showCategories />
              ))}
            </div>
            {filtered.length > shown.length && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisible((n) => n + PAGE_SIZE)}
                  className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-bold hover:bg-muted cursor-pointer"
                >
                  Show {Math.min(PAGE_SIZE, filtered.length - shown.length)} more
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-12 border border-dashed border-border rounded-xl bg-muted/20 space-y-3">
            <p className="text-muted-foreground">No articles match these filters.</p>
            <button type="button" onClick={clearAll} className="text-sm font-bold text-primary hover:underline underline-offset-4 cursor-pointer">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
