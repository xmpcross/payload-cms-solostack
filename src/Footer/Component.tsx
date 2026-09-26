import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between items-start md:items-center">
        <Link className="flex items-center" href="/">
          <Logo />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white hover:text-white/80 transition-colors text-sm" key={i} {...link} />
            })}
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex flex-col gap-1">
            <p>
              &copy; {new Date().getFullYear()} SoloStack. This website is operated by FXN Holdings (ABN: 53 274 423 748). solostack.au is a subsidiary business under FXN Holdings.
            </p>
            <p className="text-neutral-500">
              Mailing Address: PO Box 500, WEST PERTH, WA 6872, Australia &bull; Contact: <a href="mailto:contact@solostack.au" className="underline hover:text-white">contact@solostack.au</a>
            </p>
          </div>
          <div className="max-w-md text-neutral-500 md:text-right">
            <p>
              SoloStack is reader-supported. We independently research and evaluate tools and gear. We may earn an affiliate commission on qualifying purchases at no extra cost to you.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
