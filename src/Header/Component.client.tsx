'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { Menu, X, Search, Tag, Layers, Wrench, Cpu, Scale, Sparkles } from 'lucide-react'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setHeaderTheme(null)
  }, [pathname, setHeaderTheme])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-950/95 text-slate-900 dark:text-slate-100 backdrop-blur-md transition-all duration-200 shadow-2xs">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Tagline Pill */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <Logo loading="eager" priority="high" />
            </Link>
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/90 dark:border-indigo-800/90 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>Solopreneur OS</span>
            </span>
          </div>

          {/* Desktop Navigation Menu (Auto-Inserted Nav Links) */}
          <HeaderNav data={data} />

          {/* Mobile Navigation Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/deals"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300"
            >
              <Tag className="w-3 h-3 text-emerald-600" />
              <span>Deals</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-900 dark:text-slate-100" /> : <Menu className="w-6 h-6 text-slate-900 dark:text-slate-100" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/90 dark:border-slate-800 bg-white/98 dark:bg-slate-950 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top duration-200 text-slate-900 dark:text-slate-100">
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/stacks"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 text-xs font-bold text-slate-900 dark:text-slate-100"
            >
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Stacks</span>
            </Link>
            <Link
              href="/tools"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 text-xs font-bold text-slate-900 dark:text-slate-100"
            >
              <Wrench className="w-4 h-4 text-indigo-600" />
              <span>Tools</span>
            </Link>
            <Link
              href="/best-gear"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 text-xs font-bold text-slate-900 dark:text-slate-100"
            >
              <Cpu className="w-4 h-4 text-amber-600" />
              <span>Best Gear</span>
            </Link>
            <Link
              href="/comparisons"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 text-xs font-bold text-slate-900 dark:text-slate-100"
            >
              <Scale className="w-4 h-4 text-purple-600" />
              <span>Comparisons</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link
              href="/deals"
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-sm"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Verified Deals & Vouchers</span>
            </Link>
            <Link
              href="/search"
              className="ml-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <Search className="w-4 h-4 text-indigo-600" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
