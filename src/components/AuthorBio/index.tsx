import React from 'react'
import Link from 'next/link'

interface AuthorBioProps {
  authorName?: string
  bio?: string
}

export const AuthorBio: React.FC<AuthorBioProps> = ({
  authorName = 'Editorial Team',
  bio = 'The SoloStack editorial lab researches, evaluates, and field-tests software workflows, ergonomics gear, and automation blueprints for founders and creators scaling zero-headcount businesses.',
}) => {
  const initial = authorName ? authorName.charAt(0).toUpperCase() : 'S'

  return (
    <div className="not-prose mt-12 flex flex-col sm:flex-row gap-5 rounded-2xl border border-border bg-neutral-50/70 dark:bg-card p-6 sm:p-7 items-start sm:items-center shadow-2xs">
      <div className="w-14 h-14 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
        {initial}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">
          Written by
        </p>
        <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
          {authorName}
        </h4>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {bio}
        </p>
      </div>
    </div>
  )
}
