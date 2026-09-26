'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex gap-3.5 items-center">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      <Link
        href="/deals"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/90 hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-muted/50"
      >
        <span>Deals</span>
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      </Link>
      <Link href="/search" className="p-1 rounded-md hover:bg-muted/50 transition-colors">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-primary" />
      </Link>
    </nav>
  )
}
