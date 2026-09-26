import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  return (
    <footer className="mt-auto border-t border-border bg-neutral-50 dark:bg-card text-neutral-900 dark:text-white transition-colors">
      {/* 4-Column Main Footer Area */}
      <div className="container py-12">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-8 justify-between">
          {/* Column 1: 55% Width */}
          <div className="w-full lg:w-[55%] lg:pr-10">
            <Link className="inline-flex items-center gap-3 mb-4 group" href="/">
              <span className="font-extrabold text-2xl tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-[0_0_12px_rgba(16,185,129,0.7)]"></span>
                SOLOSTACK<span className="text-emerald-500">.AU</span>
              </span>
            </Link>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed max-w-xl mb-5">
              SoloStack curates production-tested software, ergonomic hardware workstations, and automated zero-headcount blueprints for solopreneurs, indie hackers, and creators scaling 1-person businesses.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
              <span>Operated by FXN Holdings</span>
              <span>&bull;</span>
              <span>ABN 53 274 423 748</span>
              <span>&bull;</span>
              <span>West Perth, WA, Australia</span>
            </div>
          </div>

          {/* Column 2: 15% Width - About */}
          <div className="w-full sm:w-1/3 lg:w-[15%]">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-neutral-900 dark:text-neutral-200 mb-4">
              About
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <Link href="/faqs" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Editorial Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: 15% Width - Topics */}
          <div className="w-full sm:w-1/3 lg:w-[15%]">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-neutral-900 dark:text-neutral-200 mb-4">
              Topics
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <Link href="/posts" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Creator Media Lab
                </Link>
              </li>
              <li>
                <Link href="/posts" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Solo Operations
                </Link>
              </li>
              <li>
                <Link href="/posts" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  AI &amp; Automation
                </Link>
              </li>
              <li>
                <Link href="/hardware" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  The Remote Desk
                </Link>
              </li>
              <li>
                <Link href="/stacks" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Stack Blueprints
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: 15% Width - Useful Links */}
          <div className="w-full sm:w-1/3 lg:w-[15%]">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-neutral-900 dark:text-neutral-200 mb-4">
              Useful Links
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <Link href="/deals" className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors font-medium text-emerald-600 dark:text-emerald-400">
                  Deals &amp; Coupons
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Software Directory
                </Link>
              </li>
              <li>
                <Link href="/hardware" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Hardware Reviews
                </Link>
              </li>
              <li>
                <Link href="/affiliate-disclosure" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Affiliate Disclosure
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sub-Footer Legal & Compliance Bar */}
      <div className="border-t border-neutral-200 dark:border-white/10">
        <div className="container py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex flex-col gap-1">
            <p>
              &copy; {new Date().getFullYear()} SoloStack. This website is operated by FXN Holdings (ABN: 53 274 423 748). solostack.au is a subsidiary business under FXN Holdings.
            </p>
            <p className="text-neutral-500 dark:text-neutral-400">
              Mailing Address: PO Box 500, WEST PERTH, WA 6872, Australia &bull; Contact: <a href="mailto:contact@solostack.au" className="underline hover:text-neutral-900 dark:hover:text-white">contact@solostack.au</a>
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <ThemeSelector />
            <p className="max-w-md text-neutral-500 dark:text-neutral-400 md:text-right">
              SoloStack is reader-supported. We independently research and evaluate tools and gear. We may earn an affiliate commission on qualifying purchases at no extra cost to you.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
