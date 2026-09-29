import type { Payload } from 'payload'

/**
 * Decides which advertisers' offers are imported and which site Category they land in.
 *
 * Each category has a list of terms (Category → Affiliate Sector Keywords, or the defaults below).
 * A term matches when it either:
 *  - equals the advertiser's network sector exactly (Awin primarySector / CJ link category), or
 *  - appears as a whole word in the advertiser's name (brand names).
 * Built-in defaults keep sector names and brand names separate so generic sector words
 * ("marketing", "office") don't match company names.
 * Categories are checked in RULE_ORDER; the first match wins.
 */

// Used when a Category has no affiliateKeywords set. Sectors are exact Awin / CJ sector names and only
// match the sector field; brands only match the advertiser name.
const DEFAULT_TERMS: Record<string, { sectors: string[]; brands: string[] }> = {
  'AI & Automation': {
    sectors: [],
    brands: [
      'jasper', 'copy.ai', 'writesonic', 'rytr', 'synthesia', 'heygen', 'pictory', 'descript', 'elevenlabs',
      'murf', 'otter.ai', 'fireflies', 'grammarly', 'quillbot', 'surfer seo', 'frase', 'zapier', 'make.com', 'n8n',
      'pabbly', 'clickup', 'notion', 'monday.com', 'airtable', 'tidio', 'manychat', 'midjourney', 'leonardo.ai',
      'runwayml', 'invideo', 'fliki', 'speechify', 'gamma.app', 'beautiful.ai',
    ],
  },
  'Websites & Hosting': {
    sectors: ['web hosting', 'web hosting/servers', 'domain registrations', 'web design', 'web tools'],
    brands: [
      'hostinger', 'namecheap', 'bluehost', 'siteground', 'kinsta', 'wp engine', 'wpengine', 'cloudways', 'godaddy',
      'ionos', 'dreamhost', 'a2 hosting', 'hostgator', 'porkbun', 'wix', 'squarespace', 'webflow', 'elementor',
      'framer', 'carrd', 'themeforest', 'envato',
    ],
  },
  'Marketing & Growth': {
    sectors: ['email marketing', 'marketing', 'search engine'],
    brands: [
      'kit.com', 'convertkit', 'mailchimp', 'mailerlite', 'activecampaign', 'aweber', 'getresponse', 'brevo',
      'klaviyo', 'beehiiv', 'semrush', 'ahrefs', 'se ranking', 'moz', 'buffer', 'hootsuite', 'later.com',
      'leadpages', 'unbounce', 'hubspot', 'pipedrive', 'systeme.io', 'clickfunnels', 'kartra',
    ],
  },
  'Creator Media Lab': {
    sectors: ['photography', 'audio visual', 'photo'],
    brands: [
      'adobe', 'canva', 'riverside', 'shure', 'rode microphones', 'elgato', 'focusrite', 'sweetwater', 'b&h photo',
      'adorama', 'dji', 'gopro', 'epidemic sound', 'artlist', 'musicbed', 'storyblocks', 'shutterstock', 'skillshare',
      'udemy', 'coursera', 'masterclass', 'domestika', 'teachable', 'kajabi', 'thinkific', 'podia',
    ],
  },
  'The Remote Desk': {
    sectors: ['computers', 'electronic accessories', 'gadgets', 'office supplies', 'computer hw', 'peripherals', 'office'],
    brands: [
      'herman miller', 'steelcase', 'autonomous.ai', 'uplift desk', 'secretlab', 'logitech', 'dell', 'lenovo', 'hp',
      'anker', 'keychron', 'benq', 'laptop outlet',
    ],
  },
  'Solopreneur Operations': {
    sectors: [
      'business services (b2b)', 'software downloads', 'computer sw', 'business-to-business', 'productivity tools',
      'computer support', 'online services',
    ],
    brands: [
      'bonsai', 'freshbooks', 'xero', 'quickbooks', 'payoneer', 'legalzoom', 'zenbusiness', 'northwest registered agent',
      '1password', 'nordvpn', 'surfshark', 'expressvpn', 'proton vpn', 'backblaze', 'dropbox', 'calendly',
      'docusign', 'pandadoc', 'norton', 'bitdefender', 'kaspersky',
    ],
  },
}

const RULE_ORDER = [
  'AI & Automation',
  'Websites & Hosting',
  'Marketing & Growth',
  'Creator Media Lab',
  'The Remote Desk',
  'Solopreneur Operations',
]

// Offer text that moves a software advertiser's coupon into AI & Automation.
const AI_TEXT = /(^|[^a-z0-9])(ai|a\.i\.|gpt|chatgpt|artificial intelligence|machine learning|chatbot|ai-powered|automate|automation|automations|no-code|nocode|workflow)(?=$|[^a-z0-9])/i
const AI_TEXT_APPLIES_TO = 'Solopreneur Operations'

type Rule = { categoryId: number; title: string; sectors: Set<string>; names: RegExp | null }

export type OfferFilter = {
  siteCategoriesOnly: boolean
  /** Returns null when the offer should be skipped, otherwise the category to assign (may be null). */
  classify: (offer: {
    advertiserId: string
    advertiserName: string
    sector: string
    text: string
  }) => { categoryId: number | null } | null
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function wordPattern(words: string[], { prefix = false } = {}): RegExp | null {
  const clean = words.map((w) => w.trim().toLowerCase()).filter(Boolean)
  if (!clean.length) return null
  // prefix: only the start must be a word boundary, so "vape" also catches "Vapesourcing".
  const tail = prefix ? '' : '(?=$|[^a-z0-9])'
  return new RegExp(`(^|[^a-z0-9])(${clean.map(escapeRe).join('|')})${tail}`, 'i')
}

function splitList(value?: string | null): string[] {
  return (value || '')
    .split(/[,\n]/)
    .map((v) => v.trim())
    .filter(Boolean)
}

export async function buildOfferFilter(
  payload: Payload,
  feed: {
    siteCategoriesOnly?: boolean | null
    includeAdvertisers?: string | null
    excludeAdvertisers?: string | null
    excludeKeywords?: string | null
  },
): Promise<OfferFilter> {
  const categories = await payload.find({ collection: 'categories', pagination: false, depth: 0 })

  const rules: Rule[] = []
  for (const cat of categories.docs as any[]) {
    // Admin-entered terms match both the sector and the advertiser name; defaults keep them separate.
    const custom = splitList(cat.affiliateKeywords).map((t) => t.toLowerCase())
    const defaults = DEFAULT_TERMS[cat.title]
    const sectors = custom.length ? custom : (defaults?.sectors ?? [])
    const brands = custom.length ? custom : (defaults?.brands ?? [])
    if (!sectors.length && !brands.length) continue
    rules.push({ categoryId: cat.id, title: cat.title, sectors: new Set(sectors), names: wordPattern(brands) })
  }
  rules.sort((a, b) => {
    const ia = RULE_ORDER.indexOf(a.title)
    const ib = RULE_ORDER.indexOf(b.title)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })

  const aiRule = rules.find((r) => r.title === 'AI & Automation')
  const include = new Set(splitList(feed.includeAdvertisers).map((v) => v.toLowerCase()))
  const exclude = new Set(splitList(feed.excludeAdvertisers).map((v) => v.toLowerCase()))
  const excludeWords = wordPattern(splitList(feed.excludeKeywords), { prefix: true })
  const siteCategoriesOnly = feed.siteCategoriesOnly !== false

  return {
    siteCategoriesOnly,
    classify({ advertiserId, advertiserName, sector, text }) {
      const id = advertiserId.toLowerCase()
      const name = advertiserName.toLowerCase()
      if (exclude.has(id) || exclude.has(name)) return null
      if (excludeWords && excludeWords.test(`${advertiserName} ${text}`)) return null

      const sectorKey = sector.trim().toLowerCase()
      const rule = rules.find((r) => (sectorKey && r.sectors.has(sectorKey)) || r.names?.test(advertiserName))
      if (rule) {
        if (rule.title === AI_TEXT_APPLIES_TO && aiRule && AI_TEXT.test(text)) return { categoryId: aiRule.categoryId }
        return { categoryId: rule.categoryId }
      }
      if (include.has(id) || include.has(name)) return { categoryId: null }
      return siteCategoriesOnly ? null : { categoryId: null }
    },
  }
}
