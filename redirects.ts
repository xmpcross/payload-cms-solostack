import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // /hardware was replaced by /best-gear; keep old links and rankings working.
  const hardwareRedirects = [
    { source: '/hardware', destination: '/best-gear', permanent: true },
    { source: '/hardware/:slug', destination: '/best-gear', permanent: true },
  ]

  return [internetExplorerRedirect, ...hardwareRedirects]
}
