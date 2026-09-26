export function generateSoftwareSchema(tool: {
  name: string
  tagline?: string
  pricingType?: string
  startingPrice?: string
  rating?: number
  affiliateUrl?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.tagline || `${tool.name} software review and workflow guide`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, macOS, Windows',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: tool.startingPrice ? tool.startingPrice.match(/\d+/)?.[0] || '0' : '0',
      priceValidationUntil: '2026-12-31',
      url: tool.affiliateUrl || 'https://solostack.au',
    },
    ...(tool.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: tool.rating,
            bestRating: 5,
            worstRating: 1,
            ratingCount: 12,
          },
        }
      : {}),
  }
}

export function generateProductSchema(hardware: {
  name: string
  manufacturer?: string
  specs?: string
  priceRange?: string
  retailUrl?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: hardware.name,
    brand: {
      '@type': 'Brand',
      name: hardware.manufacturer || 'Hardware Equipment',
    },
    description: hardware.specs || `${hardware.name} workstation hardware specification`,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      price: hardware.priceRange ? hardware.priceRange.match(/\d+/)?.[0] || '100' : '100',
      url: hardware.retailUrl || 'https://solostack.au',
    },
  }
}

export function generateStackSchema(stack: {
  title: string
  description?: string
  slug: string
  tools?: any[]
  hardware?: any[]
}) {
  const items = [
    ...(stack.tools || []).map((t, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: t.name || 'Software Tool',
    })),
    ...(stack.hardware || []).map((h, idx) => ({
      '@type': 'ListItem',
      position: (stack.tools?.length || 0) + idx + 1,
      name: h.name || 'Hardware Equipment',
    })),
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: stack.title,
    description: stack.description || `Solopreneur tech stack blueprint for ${stack.title}`,
    itemListElement: items,
  }
}
