'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Sparkles,
  Layers,
  Cpu,
  Video,
  Briefcase,
  Search,
  ArrowRight,
  Star,
  Zap,
  BookOpen,
  CheckCircle2,
  Filter,
  ChevronRight,
  Mail,
  Send,
} from 'lucide-react'

export interface CategoryData {
  id: string | number
  title: string
  slug: string
  postCount?: number
}

export interface PostData {
  id: string | number
  title: string
  slug: string
  meta?: {
    description?: string
    image?: any
  }
  heroImage?: any
  categories?: any[]
  publishedAt?: string
  authors?: any[]
}

export interface StackData {
  id: string | number
  title: string
  slug: string
  businessModel?: string
  description?: string
  monthlySoftwareCost?: string
  tools?: any[]
  hardware?: any[]
}

export interface ToolData {
  id: string | number
  name: string
  slug: string
  tagline?: string
  startingPrice?: string
  pricingType?: string
  rating?: number
}

export interface HardwareData {
  id: string | number
  name: string
  slug: string
  priceRange?: string
  verdict?: string
}

interface HomePageClientProps {
  categories: CategoryData[]
  posts: PostData[]
  stacks: StackData[]
  tools: ToolData[]
  hardware: HardwareData[]
}

// Most posts shown in the Latest Articles & Guides section (newest first).
const MAX_HOME_POSTS = 6

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'creator-media-lab': <Video className="w-5 h-5 text-indigo-600" />,
  'solopreneur-operations': <Briefcase className="w-5 h-5 text-emerald-600" />,
  'ai-automation': <Cpu className="w-5 h-5 text-purple-600" />,
  'stacks': <Layers className="w-5 h-5 text-sky-600" />,
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  'creator-media-lab': 'from-indigo-50/90 via-purple-50/40 to-white border-indigo-200/80',
  'solopreneur-operations': 'from-emerald-50/90 via-teal-50/40 to-white border-emerald-200/80',
  'ai-automation': 'from-purple-50/90 via-pink-50/40 to-white border-purple-200/80',
  'stacks': 'from-sky-50/90 via-blue-50/40 to-white border-sky-200/80',
}

export function HomePageClient({ categories, posts, stacks, tools, hardware }: HomePageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Filter posts based on category tab & search query
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Category check
      const matchesCategory =
        selectedCategory === 'all' ||
        post.categories?.some((cat) => {
          if (typeof cat === 'object') return cat.slug === selectedCategory
          return cat === selectedCategory
        })

      // Search query check
      const matchesSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.meta?.description?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesCategory && matchesSearch
    }).slice(0, MAX_HOME_POSTS)
  }, [posts, selectedCategory, searchQuery])

  // Get image URL helper
  const getImageUrl = (imageObj: any) => {
    if (!imageObj) return null
    if (typeof imageObj === 'string') return imageObj
    return imageObj.url || imageObj.sizes?.medium?.url || imageObj.sizes?.thumbnail?.url || null
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 selection:bg-indigo-500 selection:text-white">
      {/* 1. HERO SECTION (2-COLUMN REDESIGN) */}
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50">
        {/* Soft glowing ambient radial backdrops */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-indigo-200/40 via-purple-200/30 to-pink-200/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-sky-200/30 rounded-full blur-[100px] pointer-events-none" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* LEFT COLUMN: Main Headline, Search & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Top Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-slate-600">2026 Solopreneur Standard</span>
                <span className="text-slate-300">•</span>
                <span className="text-indigo-700 flex items-center gap-1 font-semibold">
                  100% Async Blueprints <Sparkles className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Architect Your <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  1-Person Empire
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Curated tech stack blueprints, AI automation pipelines, and high-performance hardware configurations built specifically for solo operators and creator-founders.
              </p>

              {/* Search Bar */}
              <div className="pt-2 max-w-xl">
                <div className="relative flex items-center rounded-2xl bg-white border border-slate-200/90 p-2 shadow-xl shadow-slate-200/60 backdrop-blur-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                  <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search blueprints, tools, hardware, or AI guides..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent px-3 py-2 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md font-medium transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Quick Topic Badges */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="text-slate-500 font-medium">Popular:</span>
                  <button
                    onClick={() => { setSelectedCategory('creator-media-lab'); setSearchQuery('') }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-700 font-medium transition-colors"
                  >
                    📹 4K Video Setup
                  </button>
                  <button
                    onClick={() => { setSelectedCategory('ai-automation'); setSearchQuery('') }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-700 font-medium transition-colors"
                  >
                    ⚡ Make.com Pipelines
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/stacks"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-900/10 hover:bg-slate-800 hover:scale-[1.01] transition-all"
                >
                  <span>Explore Stacks</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/deals"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/90 font-bold text-sm hover:bg-emerald-100/80 transition-all"
                >
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>Browse Verified Deals</span>
                </Link>
              </div>

              {/* Quick Metrics Bar */}
              <div className="pt-6 grid grid-cols-4 gap-3 max-w-xl border-t border-slate-200/80">
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">5+</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">Pillars</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-indigo-600 font-mono">100%</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">Verified</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-purple-600 font-mono">0</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">Employees</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-mono">$50k+</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">Async Goal</div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Blueprint Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl border border-slate-200/90 bg-white/90 p-6 sm:p-7 shadow-2xl shadow-slate-200/80 backdrop-blur-xl space-y-5">
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Featured Blueprint OS</h3>
                      <p className="text-[11px] text-slate-500">1-Person Operating System</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    VERIFIED
                  </span>
                </div>

                {/* Stack Blueprint Highlight Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-slate-50 to-purple-50/50 border border-indigo-100/80 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-indigo-600">Solopreneur Blueprint #01</div>
                      <h4 className="text-base font-extrabold text-slate-900 mt-0.5">Full-Stack AI Creator Stack</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-900">$149/mo</div>
                      <div className="text-[10px] text-slate-500">Software cost</div>
                    </div>
                  </div>

                  {/* Tool Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700">Claude 3.5 Sonnet</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700">Notion OS</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700">Make.com</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700">Screen Studio</span>
                  </div>
                </div>

                {/* Partner Deals Live Callout */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900">Featured Deal: </span>
                      <span className="text-slate-600">NordVPN 75% OFF + 3 Free Months</span>
                    </div>
                  </div>
                  <Link href="/deals" className="font-bold text-emerald-700 hover:underline shrink-0">
                    Claim →
                  </Link>
                </div>

                {/* Hardware Setup Quick Preview */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-amber-500" /> Recommended Hardware
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">~$3.4k total</span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    MacBook Pro M3 Max (36GB) • Sony A7IV 4K Cam • Elgato Key Light Air • Herman Miller Aeron
                  </div>
                </div>

                {/* Blueprint Card Footer Link */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Updated weekly with real workflow data</span>
                  <Link
                    href="/stacks"
                    className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>View All Stacks</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES NAVIGATION MATRIX (Light Mode) */}
      <section className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
                Knowledge Core
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Explore Solopreneur Pillars
              </h2>
            </div>
            <p className="text-sm text-slate-600 max-w-md">
              Targeted blueprints for media production, zero-employee operations, AI orchestration, and ergonomic desk setups.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((category) => {
              const icon = CATEGORY_ICONS[category.slug] || <BookOpen className="w-5 h-5 text-indigo-600" />
              const gradientClass = CATEGORY_GRADIENTS[category.slug] || 'from-slate-100 to-white border-slate-200'
              const isSelected = selectedCategory === category.slug

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(isSelected ? 'all' : category.slug)
                  }}
                  className={`group relative text-left p-5 rounded-2xl border bg-gradient-to-b transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md ${
                    isSelected
                      ? 'border-indigo-500 bg-white ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/5'
                      : `${gradientClass} bg-white hover:bg-slate-50/50`
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm group-hover:border-indigo-200 transition-colors">
                      {icon}
                    </div>
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Category
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {category.title}
                  </h3>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium pt-3 border-t border-slate-200/60">
                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-slate-600 group-hover:text-indigo-600">
                      Browse Guides <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* 3. FEATURED STACK SPOTLIGHT (Light Mode) */}
      {stacks.length > 0 && (
        <section className="py-16 bg-white border-b border-slate-200/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 p-8 sm:p-12 overflow-hidden shadow-xl shadow-indigo-100/50">
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-7">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-xs font-semibold text-indigo-800 mb-4">
                    <Zap className="w-3.5 h-3.5 text-indigo-600" /> Featured Stack Blueprint
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {stacks[0].title}
                  </h3>
                  <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                    {stacks[0].description}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono">
                    <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-sm">
                      <span className="text-slate-500">Business Model:</span>{' '}
                      <span className="text-slate-900 font-semibold capitalize">{stacks[0].businessModel || 'Solo Creator'}</span>
                    </div>
                    {stacks[0].monthlySoftwareCost && (
                      <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-sm">
                        <span className="text-slate-500">Software Budget:</span>{' '}
                        <span className="text-emerald-600 font-semibold">{stacks[0].monthlySoftwareCost}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <Link
                      href={`/stacks/${stacks[0].slug}`}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 group"
                    >
                      View Complete Blueprint <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Stack Blueprint Tools Showcase Card */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-md shadow-slate-200/50">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center justify-between">
                    <span>Stack Components</span>
                    <span className="text-indigo-600 font-mono">2026 Spec</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold">
                          R
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">Riverside.fm</div>
                          <div className="text-[11px] text-slate-500">4K Remote Video Recording</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-emerald-600 font-bold">$15/mo</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 text-xs font-bold">
                          D
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">Descript AI</div>
                          <div className="text-[11px] text-slate-500">Text-Based Audio/Video Editing</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-emerald-600 font-bold">$12/mo</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 text-xs font-bold">
                          S
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">Shure SM7B</div>
                          <div className="text-[11px] text-slate-500">Broadcast Vocal Microphone</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-900 font-bold">$399</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. ARTICLES & GUIDES GRID (Light Mode) */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1">
                Field Manuals
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Latest Articles & Guides
              </h2>
            </div>

            {/* Filter Tabs Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                All Articles ({posts.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Filter className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900">No articles found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No matching guides were found for the selected category or search filter.
              </p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery('') }}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => {
                const imageUrl = getImageUrl(post.heroImage || post.meta?.image)
                const categoryObj = post.categories?.[0]
                const categoryTitle = typeof categoryObj === 'object' ? categoryObj.title : 'Guide'

                return (
                  <article
                    key={post.id}
                    className="group flex flex-col rounded-2xl bg-white border border-slate-200/90 overflow-hidden hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
                  >
                    {/* Media Header */}
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-indigo-50 flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md bg-white/95 border border-slate-200 text-[11px] font-bold text-indigo-700 backdrop-blur-md shadow-sm">
                          {categoryTitle}
                        </span>
                      </div>
                    </div>

                    {/* Article Content */}
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                          <Link href={`/posts/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h3>
                        {post.meta?.description && (
                          <p className="mt-2.5 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                            {post.meta.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="font-medium text-slate-500">SoloStack Guide</span>
                        <Link
                          href={`/posts/${post.slug}`}
                          className="inline-flex items-center gap-1 font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors"
                        >
                          Read Article <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. TOP TOOLS & HARDWARE SHOWCASE (Light Mode) */}
      <section className="py-16 bg-white border-t border-b border-slate-200/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">
                Verified Hardware & Software
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                High-Leverage Solopreneur Toolkit
              </h2>
            </div>
            <Link
              href="/tools"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hidden sm:flex"
            >
              View Full Index <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.slice(0, 4).map((tool) => (
              <div
                key={tool.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {tool.pricingType || 'freemium'}
                    </span>
                    {tool.rating && (
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {tool.rating}
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{tool.name}</h3>
                  {tool.tagline && (
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {tool.tagline}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-700 font-semibold">{tool.startingPrice || 'Free Plan'}</span>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5"
                  >
                    Specs <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. NEWSLETTER SUBSCRIPTION SECTION */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl shadow-indigo-950/20">
            {/* Ambient decorative glowing spots */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Column: Heading & Feature Checks */}
              <div className="lg:col-span-7 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-200 mb-4">
                  <Mail className="w-3.5 h-3.5 text-indigo-300" /> Weekly Tech & AI Newsletter
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Subscribe to Our Newsletter
                </h2>
                <p className="mt-3 text-indigo-100/80 text-sm sm:text-base leading-relaxed max-w-xl">
                  Get the latest software reviews, hardware guides, and AI automation workflows delivered straight to your inbox every week.
                </p>

                {/* Feature Bullet Badges */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-indigo-100/90 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Weekly software & hardware reviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Actionable AI & Make.com guides</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Curated solopreneur tech stacks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>100% free, unsubscribe in 1 click</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Form */}
              <div className="lg:col-span-5">
                <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      alert('Thank you for subscribing to our newsletter!')
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-indigo-200 mb-1.5 text-left">
                        Work Email Address
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="email"
                          required
                          placeholder="you@company.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      Subscribe Now <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>

                  <div className="mt-4 text-center text-[11px] text-indigo-200/60">
                    We respect your privacy. No spam, ever.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
