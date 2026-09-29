'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Tag, Search, SlidersHorizontal, CheckCircle2, X } from 'lucide-react'
import { CouponCard } from '@/components/marketing/CouponCard'

export interface DealItem {
  id: string | number
  title: string
  storeName: string
  network: string
  category?: string
  code?: string
  discountText?: string
  destinationUrl: string
  affiliateUrl: string
  expiryDate?: string
  terms?: string
  clicks?: number
}

interface DealsClientProps {
  initialDeals: DealItem[]
}


const BRAND_PREVIEW = 8
// Offers rendered at first, and added per click of "Show more".
const PAGE_SIZE = 25

type Counted = { name: string; count: number }

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5 py-4 border-t border-slate-100 dark:border-neutral-800 first:border-t-0 first:pt-0">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">{title}</h3>
      {children}
    </div>
  )
}

function OptionRow({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-left text-sm transition-colors cursor-pointer ${
        active
          ? 'bg-blue-600 text-white font-semibold'
          : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800'
      }`}
    >
      <span className="truncate">{label}</span>
      <span className={`text-xs tabular-nums ${active ? 'text-blue-100' : 'text-slate-400 dark:text-neutral-500'}`}>{count}</span>
    </button>
  )
}

export function DealsClient({ initialDeals }: DealsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Stores')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [offerType, setOfferType] = useState<'all' | 'code' | 'deal'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [brandQuery, setBrandQuery] = useState<string>('')
  const [showAllBrands, setShowAllBrands] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const tally = (values: (string | undefined)[]): Counted[] => {
    const counts = new Map<string, number>()
    for (const v of values) if (v) counts.set(v, (counts.get(v) || 0) + 1)
    return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }

  const categories = useMemo(() => tally(initialDeals.map((d) => d.category)), [initialDeals])
  const brands = useMemo(() => tally(initialDeals.map((d) => d.storeName)), [initialDeals])
  const codeCount = useMemo(() => initialDeals.filter((d) => Boolean(d.code)).length, [initialDeals])
  const dealCount = initialDeals.length - codeCount

  const filteredDeals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return initialDeals.filter((deal) => {
      if (selectedCategory !== 'All Stores' && deal.category !== selectedCategory) return false
      if (selectedBrand !== 'all' && deal.storeName !== selectedBrand) return false
      if (offerType === 'code' && !deal.code) return false
      if (offerType === 'deal' && deal.code) return false
      if (query) {
        return [deal.storeName, deal.title, deal.code, deal.category].some((v) => v?.toLowerCase().includes(query))
      }
      return true
    })
  }, [initialDeals, selectedCategory, selectedBrand, offerType, searchQuery])

  // Back to the first page whenever the filters change.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [selectedCategory, selectedBrand, offerType, searchQuery])

  const shownDeals = filteredDeals.slice(0, visibleCount)

  const visibleBrands = useMemo(() => {
    const q = brandQuery.trim().toLowerCase()
    const list = q ? brands.filter((b) => b.name.toLowerCase().includes(q)) : brands
    // Keep the selected brand visible even when it falls outside the preview.
    if (q || showAllBrands) return list
    const preview = list.slice(0, BRAND_PREVIEW)
    const selected = list.find((b) => b.name === selectedBrand)
    return selected && !preview.includes(selected) ? [...preview, selected] : preview
  }, [brands, brandQuery, showAllBrands, selectedBrand])

  const activeFilters =
    (selectedCategory !== 'All Stores' ? 1 : 0) +
    (selectedBrand !== 'all' ? 1 : 0) +
    (offerType !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0)

  const resetFilters = () => {
    setSelectedCategory('All Stores')
    setSelectedBrand('all')
    setOfferType('all')
    setSearchQuery('')
    setBrandQuery('')
  }

  const chips: { label: string; clear: () => void }[] = [
    ...(selectedCategory !== 'All Stores' ? [{ label: selectedCategory, clear: () => setSelectedCategory('All Stores') }] : []),
    ...(selectedBrand !== 'all' ? [{ label: selectedBrand, clear: () => setSelectedBrand('all') }] : []),
    ...(offerType !== 'all'
      ? [{ label: offerType === 'code' ? 'Coupon codes' : 'Deals', clear: () => setOfferType('all') }]
      : []),
    ...(searchQuery.trim() ? [{ label: `"${searchQuery.trim()}"`, clear: () => setSearchQuery('') }] : []),
  ]

  const sidebar = (
    <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-4 shadow-2xs">
      <div className="flex items-center justify-between pb-3">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </h2>
        {activeFilters > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold text-blue-600 hover:underline underline-offset-4 cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterGroup title="Offer type">
        <OptionRow label="All offers" count={initialDeals.length} active={offerType === 'all'} onClick={() => setOfferType('all')} />
        <OptionRow label="Coupon codes" count={codeCount} active={offerType === 'code'} onClick={() => setOfferType('code')} />
        <OptionRow label="Deals (no code)" count={dealCount} active={offerType === 'deal'} onClick={() => setOfferType('deal')} />
      </FilterGroup>

      <FilterGroup title="Category">
        <OptionRow
          label="All categories"
          count={initialDeals.length}
          active={selectedCategory === 'All Stores'}
          onClick={() => setSelectedCategory('All Stores')}
        />
        {categories.map((c) => (
          <OptionRow key={c.name} label={c.name} count={c.count} active={selectedCategory === c.name} onClick={() => setSelectedCategory(c.name)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Brand">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={brandQuery}
            onChange={(e) => setBrandQuery(e.target.value)}
            placeholder="Find a brand..."
            aria-label="Find a brand"
            className="w-full pl-8 pr-2 h-9 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-md text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className={`space-y-1 ${showAllBrands || brandQuery ? 'max-h-72 overflow-y-auto pr-1' : ''}`}>
          <OptionRow label="All brands" count={initialDeals.length} active={selectedBrand === 'all'} onClick={() => setSelectedBrand('all')} />
          {visibleBrands.map((b) => (
            <OptionRow key={b.name} label={b.name} count={b.count} active={selectedBrand === b.name} onClick={() => setSelectedBrand(b.name)} />
          ))}
          {brandQuery && visibleBrands.length === 0 && <p className="px-2.5 py-1 text-xs text-slate-500">No brands match.</p>}
        </div>
        {!brandQuery && brands.length > BRAND_PREVIEW && (
          <button
            type="button"
            onClick={() => setShowAllBrands((v) => !v)}
            className="text-xs font-semibold text-blue-600 hover:underline underline-offset-4 cursor-pointer"
          >
            {showAllBrands ? 'Show fewer brands' : `Show all ${brands.length} brands`}
          </button>
        )}
      </FilterGroup>

    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[17rem_minmax(0,1fr)] gap-6 items-start">
      {/* Filter sidebar: always visible on desktop, collapsible on mobile */}
      <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          className="lg:hidden w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 px-4 py-3 text-sm font-bold text-slate-900 dark:text-white shadow-2xs cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-4 w-4" />
            Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
          </span>
          <span className="text-xs font-medium text-slate-500">{filtersOpen ? 'Hide' : 'Show'}</span>
        </button>
        <div className={`${filtersOpen ? 'block mt-3' : 'hidden'} lg:block`}>{sidebar}</div>
      </aside>

      {/* Results */}
      <div className="space-y-4 min-w-0">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search stores, coupon codes and offers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 h-11 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-neutral-700 rounded px-1.5 py-0.5 bg-white dark:bg-neutral-900">
              /
            </kbd>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="text-sm font-semibold text-slate-600 dark:text-neutral-400">
            Showing <span className="text-slate-900 dark:text-white font-bold">{shownDeals.length}</span> of {filteredDeals.length} offers
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Active offers only</span>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-1">
            {chips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.clear}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 px-2.5 py-1 text-xs font-semibold cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-500/20"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}

        {filteredDeals.length > 0 ? (
          <div className="space-y-3">
            {shownDeals.map((deal) => (
              <CouponCard
                key={deal.id}
                id={deal.id}
                title={deal.title}
                storeName={deal.storeName}
                network={deal.network}
                category={deal.category}
                code={deal.code}
                discountText={deal.discountText}
                affiliateUrl={deal.affiliateUrl}
                expiryDate={deal.expiryDate}
                terms={deal.terms}
                clicks={deal.clicks}
              />
            ))}
            {filteredDeals.length > shownDeals.length && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-5 py-2.5 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer shadow-2xs"
                >
                  Show {Math.min(PAGE_SIZE, filteredDeals.length - shownDeals.length)} more
                  <span className="ml-1.5 font-normal text-slate-500">
                    ({shownDeals.length} of {filteredDeals.length})
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 px-4 border border-dashed border-slate-300 dark:border-neutral-800 rounded-xl bg-slate-50/50 dark:bg-neutral-900/50 space-y-3">
            <Tag className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No matching offers found</h3>
            <p className="text-sm text-slate-500 dark:text-neutral-400 max-w-md mx-auto">
              Nothing matches these filters. Try removing one, or clear them all.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold text-blue-600 hover:underline underline-offset-4 cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
