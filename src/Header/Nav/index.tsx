'use client'

import React from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Tag, Layers, Wrench, Cpu, BookOpen, Scale } from 'lucide-react'

// Default auto-inserted top navigation links
const DEFAULT_TOP_NAV_LINKS = [
  { label: 'Stacks', url: '/stacks', icon: <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" /> },
  { label: 'Tools', url: '/tools', icon: <Wrench className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> },
  { label: 'Hardware', url: '/hardware', icon: <Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400" /> },
  { label: 'Comparisons', url: '/comparisons', icon: <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400" /> },
  { label: 'Articles', url: '/posts', icon: <BookOpen className="w-4 h-4 text-slate-600 dark:text-slate-400" /> },
]

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const pathname = usePathname()
  const rawCmsNavItems = data?.navItems || []
  const cmsNavItems = rawCmsNavItems.filter((item) => {
    const url = item?.link?.url || ''
    const label = item?.link?.label?.toLowerCase() || ''
    return url !== '/contact' && !url.includes('contact') && label !== 'contact' && label !== 'contact us'
  })

  // Create a combined list of nav items ensuring default items are present if CMS list doesn't cover them
  const cmsUrls = new Set(cmsNavItems.map((item) => item?.link?.url).filter(Boolean))
  const autoInsertedLinks = DEFAULT_TOP_NAV_LINKS.filter((item) => !cmsUrls.has(item.url))

  return (
    <nav className="hidden md:flex items-center gap-1 lg:gap-2">
      {/* Auto-Inserted Core Top Nav Links */}
      {autoInsertedLinks.map((item) => {
        const isActive = pathname === item.url || (item.url !== '/' && pathname?.startsWith(item.url))
        return (
          <Link
            key={item.url}
            href={item.url}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-bold transition-all duration-200 ${
              isActive
                ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold shadow-2xs'
                : 'text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/90 dark:hover:bg-slate-900/80'
            }`}
          >
            {item.icon}
            <span className="text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400">{item.label}</span>
          </Link>
        )
      })}

      {/* CMS Custom Links */}
      {cmsNavItems.map(({ link }, i) => {
        return (
          <div key={i} className="px-1.5 text-xs lg:text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            <CMSLink {...link} appearance="link" className="text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold" />
          </div>
        )
      })}

      {/* Verified Deals Pill (Pulsing Badge) */}
      <Link
        href="/deals"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs lg:text-sm font-bold transition-all duration-200 border ${
          pathname === '/deals'
            ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/80'
        }`}
      >
        <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-emerald-900 dark:text-emerald-200">Deals</span>
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      </Link>

      {/* Search Button Link */}
      <Link
        href="/search"
        className="ml-1 p-2 rounded-lg text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        title="Search SoloStack"
      >
        <span className="sr-only">Search</span>
        <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      </Link>
    </nav>
  )
}
