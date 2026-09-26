'use client'

import React, { useState, useMemo } from 'react'
import { Tag, Search, Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { CouponCard } from '@/components/marketing/CouponCard'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

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
  'All Deals',
  'Software & Web Hosting',
  'Travel & Booking',
  'Beauty & Personal Care',
  'Electronics & Tech',
  'Fashion & Apparel',
]

export function DealsClient({ initialDeals }: DealsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Deals')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all')

  const filteredDeals = useMemo(() => {
    return initialDeals.filter((deal) => {
      // Category filter
      if (selectedCategory !== 'All Deals' && deal.category !== selectedCategory) {
        return false
      }
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
  }, [initialDeals, selectedCategory, selectedNetwork, searchQuery])

  return (
    <div className="space-y-8">
      {/* Controls Bar */}
      <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
        {/* Search & Network Selector */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by store name, promo code, or offer keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-background/80 border-border/70 rounded-xl focus-visible:ring-primary text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Network:
            </span>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="h-11 px-3 text-xs font-medium rounded-xl border border-border/70 bg-background/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto cursor-pointer"
            >
              <option value="all">All Networks</option>
              <option value="cj">CJ Affiliate</option>
              <option value="awin">Awin Network</option>
              <option value="direct">Direct Merchant</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.02]'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50'
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
        <div className="text-sm font-semibold text-muted-foreground">
          Showing <span className="text-foreground font-bold">{filteredDeals.length}</span> verified offers
          {selectedCategory !== 'All Deals' && ` in ${selectedCategory}`}
        </div>
        {filteredDeals.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tested & Validated</span>
          </div>
        )}
      </div>

      {/* Grid of Deals */}
      {filteredDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 border border-dashed rounded-2xl bg-muted/20 space-y-3">
          <Tag className="h-10 w-10 text-muted-foreground/50 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">No matching deals found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We couldn't find any offers matching your current filter criteria. Try selecting another category or clearing your search term.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All Deals')
              setSelectedNetwork('all')
              setSearchQuery('')
            }}
            className="text-xs font-semibold text-primary hover:underline underline-offset-4"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  )
}
