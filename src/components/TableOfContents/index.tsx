import React from 'react'

export interface TOCItem {
  id: string
  text: string
}

export const TableOfContents: React.FC<{ items: TOCItem[] }> = ({ items }) => {
  if (!items || items.length === 0) return null

  return (
    <nav
      aria-labelledby="article-contents-title"
      className="not-prose mb-8 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-border p-6 sm:p-7 shadow-2xs"
    >
      <p
        id="article-contents-title"
        className="mb-4 text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2"
      >
        <span>Contents</span>
      </p>
      <ul className="list-disc space-y-2.5 pl-5 marker:text-emerald-600 dark:marker:text-emerald-400">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-200">
            <a
              href={`#${item.id}`}
              className="font-medium text-neutral-900 dark:text-neutral-100 underline decoration-border hover:decoration-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline-offset-4"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
