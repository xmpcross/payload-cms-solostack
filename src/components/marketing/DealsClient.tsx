'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Tag, Search, Sparkles, SlidersHorizontal, ArrowUpDown, CheckCircle2, X } from 'lucide-react'
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

const CATEGORIES = [
  'All Stores',
  'Software & Web Hosting',
  'Travel & Booking',
  'Beauty & Personal Care',
  'Electronics & Tech',
  'Fashion & Apparel',
]

export function DealsClient({ initialDeals }: DealsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Stores')
  const [offerType, setOfferType] = useState<'all' | 'code' | 'deal'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popular' | 'newest'>('popular')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut '/' to focus search like CouponPilot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const codeCount = useMemo(() => initialDeals.filter((d) => Boolean(d.code)).length, [initialDeals])
  const dealCount = useMemo(() => initialDeals.filter((d) => !d.code).length, [initialDeals])

  const filteredDeals = useMemo(() => {
    return initialDeals.filter((deal) => {
      // Category filter
      if (selectedCategory !== 'All Stores' && deal.category !== selectedCategory) {
        return false
      }
      // Offer type filter
      if (offerType === 'code' && !deal.code) return false
      if (offerType === 'deal' && Boolean(deal.code)) return false

      // Network filter
      if (selectedNetwork !== 'all' && deal.network !== selectedNetwork) {
        return false
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesStore = deal.storeName?.toLowerCase().includes(query)
        const matchesTitle = deal.title?.toLowerCase().includes(query)
        const matchesCode = deal.code?.toLowerCase().includes(query)
        const matchesCat = deal.category?.toLowerCase().includes(query)
        return matchesStore || matchesTitle || matchesCode || matchesCat
      }
      return true
    })
  }, [initialDeals, selectedCategory, offerType, selectedNetwork, searchQuery])

  return (
    <div className="space-y-6">
      {/* Search & Filter Header (CouponPilot Style) */}
      <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Top Search Input & Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search stores, coupon codes, and offers (e.g. NordVPN, Hostinger)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 h-11 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-neutral-700 rounded px-1.5 py-0.5 bg-white dark:bg-neutral-900 shadow-2xs">
                /
              </kbd>
            )}
          </div>

          {/* Network Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 whitespace-nowrap flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Network:
            </span>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="h-11 px-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-auto cursor-pointer"
            >
              <option value="all">All Verified Networks</option>
              <option value="cj">CJ Affiliate</option>
              <option value="awin">Awin Network</option>
            </select>
          </div>
        </div>

        {/* Offer Type Tabs (CouponPilot Subnav) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setOfferType('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                offerType === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Offers ({initialDeals.length})
            </button>
            <button
              onClick={() => setOfferType('code')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                offerType === 'code'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Coupon Codes ({codeCount})
            </button>
            <button
              onClick={() => setOfferType('deal')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                offerType === 'deal'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Exclusive Deals ({dealCount})
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-neutral-400 hidden sm:block">
            Showing <strong className="text-slate-900 dark:text-white">{filteredDeals.length}</strong> active offers
          </div>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-semibold text-slate-600 dark:text-neutral-400">
          Showing <span className="text-slate-900 dark:text-white font-bold">{filteredDeals.length}</span> verified offers
          {selectedCategory !== 'All Stores' && ` in ${selectedCategory}`}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Every code tested before listing</span>
        </div>
      </div>

      {/* Vertical Stream of Voucher Rows (Signature CouponPilot Layout) */}
      {filteredDeals.length > 0 ? (
        <div className="space-y-3">
          {filteredDeals.map((deal) => (
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
        </div>
      ) : (
        <div className="text-center py-16 px-4 border border-dashed border-slate-300 dark:border-neutral-800 rounded-xl bg-slate-50/50 dark:bg-neutral-900/50 space-y-3">
          <Tag className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No matching offers found</h3>
          <p className="text-sm text-slate-500 dark:text-neutral-400 max-w-md mx-auto">
            We couldn't find any vouchers matching your search. Try changing your category filter or clearing your query.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All Stores')
              setOfferType('all')
              setSelectedNetwork('all')
              setSearchQuery('')
            }}
            className="text-xs font-bold text-blue-600 hover:underline underline-offset-4 cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  )
}
