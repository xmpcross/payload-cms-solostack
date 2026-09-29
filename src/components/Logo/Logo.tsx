import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  mode?: 'light' | 'dark' | 'auto'
}

export const Logo: React.FC<Props> = (props) => {
  const { className, mode = 'auto' } = props

  if (mode === 'light') {
    return (
      <div className={clsx('inline-flex items-center', className)}>
        <img src="/solostack-logo-light.svg" alt="SoloStack" className="h-8 sm:h-9 w-auto" />
      </div>
    )
  }

  if (mode === 'dark') {
    return (
      <div className={clsx('inline-flex items-center', className)}>
        <img src="/solostack-logo-dark.svg" alt="SoloStack" className="h-8 sm:h-9 w-auto" />
      </div>
    )
  }

  return (
    <div className={clsx('inline-flex items-center', className)}>
      {/* Light Mode SVG Logo */}
      <img
        src="/solostack-logo-light.svg"
        alt="SoloStack"
        className="dark:hidden h-8 sm:h-9 w-auto"
      />
      {/* Dark Mode SVG Logo */}
      <img
        src="/solostack-logo-dark.svg"
        alt="SoloStack"
        className="hidden dark:block h-8 sm:h-9 w-auto"
      />
    </div>
  )
}
