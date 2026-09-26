'use client'

import React, { useState } from 'react'
import { Tag, Copy, Check, ExternalLink, Clock, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
}: CouponCardProps) {
  const [copied, setCopied] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  const handleCopy = () => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const networkLabel = network === 'cj' ? 'CJ Affiliate' : network === 'awin' ? 'Awin Network' : 'Direct Deal'

  return (
    <div className="bg-card border border-border/80 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5 relative overflow-hidden group">
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-foreground tracking-tight">{storeName}</span>
          <Badge variant="outline" className="text-[11px] font-semibold bg-primary/5 text-primary border-primary/20">
            {networkLabel}
          </Badge>
          {category && (
            <Badge variant="secondary" className="text-[11px] hidden sm:inline-flex">
              {category}
            </Badge>
          )}
        </div>

        {discountText && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <Tag className="h-3.5 w-3.5" />
            <span>{discountText}</span>
          </div>
        )}
      </div>

      {/* Main Headline */}
      <div>
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
          {title}
        </h3>
        {expiryDate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Expires: {new Date(expiryDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Actions & Code Row */}
      <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
        {code ? (
          <div className="flex items-center gap-2 bg-muted/40 border border-dashed border-border rounded-lg px-3 py-1.5">
            <span className="font-mono font-bold text-sm text-foreground tracking-wider select-all">{code}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-7 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>No code required. Discount automatically applied.</span>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {terms && (
            <button
              onClick={() => setShowTerms(!showTerms)}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              {showTerms ? 'Hide Terms' : 'View Terms'}
            </button>
          )}

          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold text-xs px-4 py-2 rounded-lg hover:opacity-95 shadow transition-all"
          >
            <span>Claim Offer</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Terms Drawer */}
      {showTerms && terms && (
        <div className="p-3 bg-muted/30 border border-border/60 rounded-lg text-xs text-muted-foreground leading-relaxed mt-2">
          <strong>Terms & Conditions:</strong> {terms}
        </div>
      )}
    </div>
  )
}
