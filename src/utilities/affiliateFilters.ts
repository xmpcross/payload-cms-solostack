import type { Payload } from 'payload'

/**
 * Decides which advertisers' offers are imported and which site Category they land in.
 * Matching runs against the advertiser's network sector (Awin primarySector / CJ link category)
 * plus the advertiser name. Rules are checked in order; the first matching category wins.
 */

// Used when a Category has no affiliateKeywords set. Order matters: specific before broad.
const DEFAULT_KEYWORDS: Record<string, string[]> = {
  'AI & Automation': [
    'ai', 'artificial intelligence', 'automation', 'no-code', 'nocode', 'chatbot', 'workflow', 'machine learning',
    // Networks have no "AI" sector, so well-known AI / automation brands are matched by advertiser name.
    'jasper', 'copy.ai', 'writesonic', 'rytr', 'synthesia', 'heygen', 'pictory', 'descript', 'elevenlabs',
    'murf', 'otter.ai', 'fireflies', 'grammarly', 'quillbot', 'surfer', 'frase', 'zapier', 'make.com', 'n8n',
    'pabbly', 'clickup', 'notion', 'monday.com', 'airtable', 'tidio', 'manychat', 'midjourney', 'leonardo.ai',
    'runway', 'invideo', 'fliki', 'speechify', 'tome', 'gamma', 'beautiful.ai',
  ],
  'Websites & Hosting': [
    'hosting', 'web hosting', 'web hosting/servers', 'servers', 'domain', 'domains', 'domain registrations',
    'website builder', 'site builder', 'wordpress', 'themes', 'plugins', 'ssl', 'cdn',
    'hostinger', 'namecheap', 'bluehost', 'siteground', 'kinsta', 'wp engine', 'wpengine', 'cloudways', 'godaddy',
    'ionos', 'dreamhost', 'a2 hosting', 'hostgator', 'porkbun', 'wix', 'squarespace', 'webflow', 'elementor',
    'framer', 'carrd', 'themeforest', 'envato',
  ],
  'Marketing & Growth': [
    'marketing', 'email marketing', 'online marketing', 'digital marketing', 'seo', 'advertising', 'social media',
    'crm', 'lead generation', 'landing page', 'landing pages', 'newsletter', 'analytics',
    'kit.com', 'convertkit', 'mailchimp', 'mailerlite', 'activecampaign', 'aweber', 'getresponse', 'brevo', 'klaviyo',
    'beehiiv', 'semrush', 'ahrefs', 'se ranking', 'moz', 'buffer', 'hootsuite', 'later.com', 'leadpages', 'unbounce',
    'hubspot', 'pipedrive', 'systeme.io', 'clickfunnels', 'kartra',
  ],
  'Creator Media Lab': [
    'camera', 'cameras', 'photo', 'photography', 'video', 'audio', 'music', 'microphone', 'podcast',
    'stock media', 'stock photos', 'design', 'creative', 'editing', 'streaming', 'courses', 'online courses',
    'education', 'e-learning', 'learning',
  ],
  'The Remote Desk': [
    'laptop', 'laptops', 'electronics', 'consumer electronics', 'office', 'office supplies',
    'furniture', 'desk', 'chair', 'monitor', 'headphones', 'keyboard', 'gadgets', 'computer hw', 'hardware',
  ],
  'Solopreneur Operations': [
    'software', 'computer sw', 'saas', 'ecommerce', 'e-commerce', 'accounting', 'invoicing', 'productivity',
    'business', 'business-to-business', 'b2b', 'business services', 'vpn', 'security', 'antivirus', 'cloud',
    'online services', 'technology', 'tech', 'internet', 'telecoms',
  ],
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

type Rule = { categoryId: number; title: string; pattern: RegExp }

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

function wordPattern(words: string[]): RegExp | null {
  const clean = words.map((w) => w.trim().toLowerCase()).filter(Boolean)
  if (!clean.length) return null
  return new RegExp(`(^|[^a-z0-9])(${clean.map(escapeRe).join('|')})(?=$|[^a-z0-9])`, 'i')
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
    const words = cat.affiliateKeywords ? splitList(cat.affiliateKeywords) : DEFAULT_KEYWORDS[cat.title] || []
    const pattern = wordPattern(words)
    if (pattern) rules.push({ categoryId: cat.id, title: cat.title, pattern })
  }
  rules.sort((a, b) => {
    const ia = RULE_ORDER.indexOf(a.title)
    const ib = RULE_ORDER.indexOf(b.title)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })

  const aiRule = rules.find((r) => r.title === 'AI & Automation')
  const include = new Set(splitList(feed.includeAdvertisers).map((v) => v.toLowerCase()))
  const exclude = new Set(splitList(feed.excludeAdvertisers).map((v) => v.toLowerCase()))
  const excludeWords = wordPattern(splitList(feed.excludeKeywords))
  const siteCategoriesOnly = feed.siteCategoriesOnly !== false

  return {
    siteCategoriesOnly,
    classify({ advertiserId, advertiserName, sector, text }) {
      const id = advertiserId.toLowerCase()
      const name = advertiserName.toLowerCase()
      if (exclude.has(id) || exclude.has(name)) return null
      if (excludeWords && excludeWords.test(`${advertiserName} ${text}`)) return null

      const haystack = `${sector} ${advertiserName}`
      const rule = rules.find((r) => r.pattern.test(haystack))
      if (rule) {
        if (rule.title === AI_TEXT_APPLIES_TO && aiRule && AI_TEXT.test(text)) return { categoryId: aiRule.categoryId }
        return { categoryId: rule.categoryId }
      }
      if (include.has(id) || include.has(name)) return { categoryId: null }
      return siteCategoriesOnly ? null : { categoryId: null }
    },
  }
}
