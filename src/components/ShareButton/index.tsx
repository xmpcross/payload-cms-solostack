'use client'

import React, { useState } from 'react'
import { Share2, Check, Copy } from 'lucide-react'

export const ShareButton: React.FC<{ title?: string }> = ({ title }) => {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (typeof window === 'undefined') return

    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || document.title,
          url,
        })
        return
      } catch (err) {
        // Fallback to clipboard if share cancelled or failed
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Share this article"
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border border-border bg-neutral-50 hover:bg-neutral-100 dark:bg-card dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors shadow-2xs cursor-pointer"
      type="button"
      title="Share or copy link"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-emerald-700 dark:text-emerald-300">Link copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
          <span>Share</span>
        </>
      )}
    </button>
  )
}
