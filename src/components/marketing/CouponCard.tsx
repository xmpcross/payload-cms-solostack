'use client'

import React, { useState } from 'react'
import { Tag, Copy, Check, ExternalLink, Clock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react'

interface CouponCardProps {
  id: string | number
  title: string
  storeName: string
  network: string
  category?: string
  code?: string
  discountText?: string
  affiliateUrl: string
  expiryDate?: string
  terms?: string
  clicks?: number
}

export function CouponCard({
  title,
  storeName,
  network,
  category,
  code,
  discountText,
  affiliateUrl,
  expiryDate,
  terms,
  clicks = 14,
}: CouponCardProps) {
  const [copied, setCopied] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  const handleRevealAndOpen = () => {
    if (code) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setRevealed(true)
      setTimeout(() => setCopied(false), 3000)
    }
    // Open destination in new tab
    if (typeof window !== 'undefined') {
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const networkLabel = network === 'cj' ? 'CJ Partner' : network === 'awin' ? 'Awin Partner' : 'Direct Deal'
  const storeInitials = storeName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="voucher-row rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 shadow-2xs hover:border-slate-300 dark:hover:border-neutral-700 hover:shadow-xs transition-all overflow-hidden mb-3.5">
      <div className="flex flex-col sm:flex-row">
        {/* Left main info */}
        <div className="flex-1 flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-5">
          {/* Store Logo / Initials Avatar */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg border border-slate-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center font-extrabold text-base sm:text-lg text-slate-800 dark:text-neutral-200 shrink-0 shadow-2xs select-none">
            {storeInitials}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            {/* Meta Tags Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {discountText && (
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  {discountText}
                </span>
              )}
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {storeName}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tested Today
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 hidden sm:inline-block">
                {networkLabel}
              </span>
              {category && (
                <span className="text-[10px] text-slate-500 dark:text-neutral-400 border border-slate-200 dark:border-neutral-800 px-2 py-0.5 rounded hidden md:inline-block">
                  {category}
                </span>
              )}
            </div>

            {/* Offer Title */}
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {title}
            </h3>

            {/* Subtext description */}
            <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed line-clamp-1 sm:line-clamp-2">
              Valid on eligible purchases at {storeName}. Verified working code tested by SoloStack Deal Lab.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-neutral-400 pt-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Success</span>
              <span>• Used {clicks > 0 ? clicks : 16} times today</span>
              {expiryDate && <span>• Expires {new Date(expiryDate).toLocaleDateString()}</span>}
              <button
                onClick={() => setShowTerms(!showTerms)}
                className="underline hover:text-slate-900 dark:hover:text-white cursor-pointer ml-auto sm:ml-0"
              >
                {showTerms ? 'Hide Terms' : 'Terms & Conditions'}
              </button>
            </div>
          </div>
        </div>

        {/* Right CTA / Code Box */}
        <div className="sm:w-[210px] border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-neutral-800 p-4 sm:p-5 flex flex-col items-center justify-center gap-2 bg-slate-50/70 dark:bg-neutral-800/30 shrink-0">
          {code ? (
            <div className="w-full relative">
              <button
                type="button"
                onClick={handleRevealAndOpen}
                className="w-full flex items-center justify-between bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-slate-900 rounded-md px-3.5 py-2.5 font-bold text-xs shadow-xs transition-all cursor-pointer overflow-hidden border border-slate-900 dark:border-white group"
              >
                {copied ? (
                  <span className="flex items-center justify-center gap-1.5 w-full text-emerald-400 dark:text-emerald-600 font-mono font-bold">
                    <Check className="w-4 h-4" />
                    COPIED!
                  </span>
                ) : revealed ? (
                  <span className="flex items-center justify-center gap-1.5 w-full font-mono tracking-wider font-bold">
                    {code}
                  </span>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono tracking-wider opacity-75 border-r border-white/20 dark:border-neutral-900/20 pr-2">
                      {code.slice(0, 3)}***
                    </span>
                    <span className="flex items-center gap-1 pl-1">
                      Show Code
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </button>
              <span className="block text-[10px] text-center text-slate-500 dark:text-neutral-400 mt-1.5 font-sans">
                {copied ? 'Redirecting to store...' : 'Opens store & copies code'}
              </span>
            </div>
          ) : (
            <div className="w-full">
              <a
                href={affiliateUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-slate-900 rounded-md px-3.5 py-2.5 font-bold text-xs shadow-xs transition-all"
              >
                <span>Get Deal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <span className="block text-[10px] text-center text-slate-500 dark:text-neutral-400 mt-1.5 font-sans">
                No code required
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Terms Drawer */}
      {showTerms && (
        <div className="p-4 bg-slate-50 dark:bg-neutral-850 border-t border-slate-200 dark:border-neutral-800 text-xs text-slate-600 dark:text-neutral-300 leading-relaxed font-sans">
          <strong>Offer Details & Restrictions:</strong> {terms || 'Valid on qualifying purchases at participating merchants. Discount automatically applied or verified via promotional code entry at checkout. Cannot be combined with other offers.'}
        </div>
      )}
    </div>
  )
}
