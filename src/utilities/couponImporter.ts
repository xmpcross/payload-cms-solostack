import type { Payload } from 'payload'
import { sql } from '@payloadcms/db-postgres'
import { buildOfferFilter } from './affiliateFilters'

/**
 * Imports coupons & promotions from affiliate network APIs into `affiliate-coupons`.
 *
 * Expiry handling (runs at the end of every import):
 *  1. Offers already past their end date are never imported.
 *  2. Imported coupons that disappear from a network's feed are deactivated
 *     (only when that network's fetch completed without errors).
 *  3. Any coupon (imported or manual) whose expiryDate has passed is deactivated.
 *  4. Imported coupons inactive for RETENTION_DAYS are deleted. Manual coupons are never deleted.
 *
 * Advertisers are filtered to the site's Categories (see affiliateFilters.ts). Coupons that stop
 * matching the filter are treated like offers removed from the feed and deactivated.
 */

export type ImportNetwork = 'awin' | 'cj' | 'takeads' | 'impact'

export const IMPORT_NETWORKS: ImportNetwork[] = ['awin', 'cj', 'takeads', 'impact']

export type NetworkImportResult = {
  network: ImportNetwork
  ok: boolean
  fetched: number
  added: number
  updated: number
  skipped: number
  failed: number
  deactivated: number
  error?: string
}

export type ImportResult = {
  startedAt: string
  finishedAt: string
  networks: NetworkImportResult[]
  expiredDeactivated: number
  purged: number
}

type NormalizedCoupon = {
  externalId: string
  title: string
  storeName: string
  advertiserId: string
  advertiserJoined: boolean
  code: string | null
  discountText: string | null
  destinationUrl: string
  affiliateUrl: string
  terms: string | null
  startDate: string | null
  expiryDate: string | null
  /** Advertiser sector/category from the network, used for filtering only (not stored). */
  sector: string
}

type ExistingCoupon = {
  id: number
  title?: string | null
  code?: string | null
  affiliateUrl?: string | null
  expiryDate?: string | null
  terms?: string | null
  isActive?: boolean | null
  siteCategory?: number | null
  siteCategoryLocked?: boolean | null
}

type CouponData = Omit<NormalizedCoupon, 'sector'> & { siteCategory: number | null }

const RETENTION_DAYS = 30
const AWIN_PAGE_SIZE = 200 // API allows 10–200
const AWIN_DELAY_MS = 3200 // Awin publisher API: 20 requests/minute
const CJ_PAGE_SIZE = 100 // Link Search max records-per-page
const CJ_DELAY_MS = 2600 // CJ REST APIs: 25 requests/minute
const TAKEADS_PAGE_SIZE = 100
const TAKEADS_DELAY_MS = 1200
const CJ_PROMOTION_TYPES = ['coupon', 'sale/discount', 'free shipping']
const STALE_LOCK_MS = 3 * 60 * 60 * 1000
const MAX_PER_ADVERTISER = 25 // per sync, so one brand can't flood the deals page

// Country names / codes that mark an advertiser account as serving another market ("Dell Technologies France").
const COUNTRY_MARKERS: Record<string, string[]> = {
  US: ['usa', 'united states', 'us'],
  GB: ['uk', 'united kingdom', 'great britain', 'gb'],
  CA: ['canada', 'ca'],
  AU: ['australia', 'au'],
  NZ: ['new zealand', 'nz'],
  IE: ['ireland', 'ie'],
  DE: ['germany', 'deutschland', 'de'],
  FR: ['france', 'fr'],
  ES: ['spain', 'españa', 'espana', 'es'],
  IT: ['italy', 'italia', 'it'],
  NL: ['netherlands', 'nederland', 'nl'],
  BE: ['belgium', 'be'],
  AT: ['austria', 'österreich', 'at'],
  CH: ['switzerland', 'schweiz', 'ch'],
  SE: ['sweden', 'sverige', 'se'],
  DK: ['denmark', 'dk'],
  NO: ['norway', 'no'],
  FI: ['finland', 'fi'],
  PL: ['poland', 'polska', 'pl'],
  CZ: ['czech', 'czechia', 'cz'],
  PT: ['portugal', 'pt'],
  BR: ['brazil', 'brasil', 'br'],
  MX: ['mexico', 'méxico', 'mx'],
  IN: ['india', 'in'],
  JP: ['japan', 'jp'],
  SG: ['singapore', 'sg'],
  EU: ['eu', 'europe', 'emea', 'nordic', 'nordics', 'latam', 'apac', 'asia'],
}

/** True when the advertiser name names a market outside `regions` (2-letter codes only match in capitals). */
function namesForeignMarket(name: string, regions: string[]): boolean {
  for (const [code, words] of Object.entries(COUNTRY_MARKERS)) {
    if (regions.includes(code)) continue
    for (const w of words) {
      const re =
        w.length <= 2
          ? new RegExp(`(^|[^A-Za-z])${w.toUpperCase()}(?=$|[^A-Za-z])`)
          : new RegExp(`(^|[^a-z])${w}(?=$|[^a-z])`, 'i')
      if (re.test(name)) return true
    }
  }
  return false
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function parseDate(value: unknown): string | null {
  if (!value || typeof value !== 'string' || value.toLowerCase() === 'ongoing') return null
  const d = new Date(value.includes(' ') && !value.includes('T') ? value.replace(' ', 'T') : value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function isExpired(iso: string | null): boolean {
  return !!iso && new Date(iso).getTime() < Date.now()
}

function extractDiscountText(text: string): string | null {
  const m =
    text.match(/(\d{1,3}\s?%\s?off)/i) ||
    text.match(/([£$€]\s?\d+(?:[.,]\d{1,2})?\s?off)/i) ||
    text.match(/(free (?:shipping|delivery))/i)
  return m ? m[1].replace(/\s+/g, ' ').toUpperCase() : null
}

function truncate(value: string | null | undefined, max: number): string | null {
  if (!value) return null
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

/* ------------------------------------------------------------------ */
/* Awin: POST /publisher/{id}/promotions                               */
/* ------------------------------------------------------------------ */

/** Advertiser ID → primary sector & home country, from GET /publishers/{id}/programmes. */
async function fetchAwinSectors(publisherId: string, token: string, membership: 'all' | 'joined') {
  const sectors = new Map<string, { sector: string; country: string }>()
  const relationships = membership === 'all' ? ['joined', 'notjoined'] : ['joined']
  for (const relationship of relationships) {
    const res = await fetch(`https://api.awin.com/publishers/${publisherId}/programmes?relationship=${relationship}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Awin programmes API ${res.status}: ${(await res.text()).slice(0, 1000)}`)
    const list = await res.json()
    for (const p of Array.isArray(list) ? list : []) {
      if (p?.id != null) {
        sectors.set(String(p.id), {
          sector: String(p.primarySector || ''),
          country: String(p.primaryRegion?.countryCode || '').toUpperCase(),
        })
      }
    }
    await sleep(AWIN_DELAY_MS)
  }
  return sectors
}

async function* fetchAwin(publisherId: string, token: string, membership: 'all' | 'joined', regions: string[]) {
  const sectors = await fetchAwinSectors(publisherId, token, membership)
  for (let page = 1; ; page++) {
    const res = await fetch(`https://api.awin.com/publisher/${publisherId}/promotions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters: { membership, status: 'active', type: 'all', ...(regions.length ? { regionCodes: regions } : {}) },
        pagination: { page, pageSize: AWIN_PAGE_SIZE },
      }),
    })
    if (!res.ok) {
      throw new Error(`Awin API ${res.status}: ${(await res.text()).slice(0, 1000)}`)
    }
    const json = await res.json()
    const items: any[] = Array.isArray(json?.data) ? json.data : []

    const coupons: NormalizedCoupon[] = []
    for (const o of items) {
      if (!o?.promotionId || !o?.advertiser) continue
      const advertiser = sectors.get(String(o.advertiser.id))
      if (regions.length) {
        // Awin's regionCodes filter also returns "all regions" offers from foreign advertisers, so require
        // the advertiser to be based in a target country and the offer to be valid there.
        const offerCountries: string[] = (o.regions?.list || []).map((r: any) => String(r?.countryCode || '').toUpperCase())
        const validThere = o.regions?.all || offerCountries.some((c) => regions.includes(c))
        if (!advertiser || !regions.includes(advertiser.country) || !validThere) continue
      }
      const title = String(o.title || o.description || '').trim()
      const url = o.url || o.urlTracking
      if (!title || !url) continue
      coupons.push({
        externalId: `awin:${o.promotionId}`,
        title: truncate(title, 250)!,
        storeName: String(o.advertiser.name || 'Unknown'),
        advertiserId: String(o.advertiser.id ?? ''),
        advertiserJoined: !!o.advertiser.joined,
        code: o.voucher?.code || null,
        discountText: extractDiscountText(`${o.title || ''} ${o.description || ''}`),
        destinationUrl: url,
        affiliateUrl: o.urlTracking || url,
        terms: truncate(o.terms, 2000),
        startDate: parseDate(o.startDate),
        expiryDate: parseDate(o.endDate),
        sector: advertiser?.sector || '',
      })
    }
    yield { coupons, raw: items.length }

    const total = Number(json?.pagination?.total)
    const done = items.length < AWIN_PAGE_SIZE || (Number.isFinite(total) && page * AWIN_PAGE_SIZE >= total)
    if (done) return
    await sleep(AWIN_DELAY_MS)
  }
}

/* ------------------------------------------------------------------ */
/* CJ: GET link-search.api.cj.com/v2/link-search (XML)                 */
/* ------------------------------------------------------------------ */

function decodeXml(value: string): string {
  return value
    .replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim()
}

function xmlTag(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`))
  return m ? decodeXml(m[1]) : ''
}

async function* fetchCj(
  websiteId: string,
  token: string,
  relationships: ('joined' | 'notjoined')[],
  regions: string[],
) {
  for (const relationship of relationships) {
    for (const promotionType of CJ_PROMOTION_TYPES) {
      for (let page = 1; ; page++) {
        const params = new URLSearchParams({
          'website-id': websiteId,
          'advertiser-ids': relationship,
          'promotion-type': promotionType,
          'records-per-page': String(CJ_PAGE_SIZE),
          'page-number': String(page),
        })
        const res = await fetch(`https://link-search.api.cj.com/v2/link-search?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const body = await res.text()
        if (!res.ok || body.includes('<error-message>')) {
          throw new Error(`CJ API ${res.status}: ${(xmlTag(body, 'error-message') || body).slice(0, 1000)}`)
        }

        const blocks = body.match(/<link>[\s\S]*?<\/link>/g) || []
        const coupons: NormalizedCoupon[] = []
        for (const b of blocks) {
          const linkId = xmlTag(b, 'link-id')
          const destination = xmlTag(b, 'destination')
          const clickUrl = xmlTag(b, 'clickUrl')
          const title = xmlTag(b, 'link-name') || xmlTag(b, 'description')
          if (!linkId || !title || !(destination || clickUrl)) continue
          if (regions.length) {
            // Link Search has no country filter. Use the link's targeted-countries when set; otherwise
            // require English and an advertiser name that doesn't point at another market.
            const targeted = xmlTag(b, 'targeted-countries')
            const countries = targeted && targeted !== 'null' ? targeted.split(/[,\s]+/).map((c) => c.toUpperCase()) : []
            if (countries.length) {
              if (!countries.some((c) => regions.includes(c))) continue
            } else {
              const language = xmlTag(b, 'language').toLowerCase()
              if (language && !language.startsWith('en')) continue
              if (namesForeignMarket(xmlTag(b, 'advertiser-name'), regions)) continue
            }
          }
          const description = xmlTag(b, 'description')
          coupons.push({
            externalId: `cj:${linkId}`,
            title: truncate(title, 250)!,
            storeName: xmlTag(b, 'advertiser-name') || 'Unknown',
            advertiserId: xmlTag(b, 'advertiser-id'),
            advertiserJoined: xmlTag(b, 'relationship-status').toLowerCase() === 'joined',
            code: xmlTag(b, 'coupon-code') || null,
            discountText: extractDiscountText(`${title} ${description}`),
            destinationUrl: destination || clickUrl,
            affiliateUrl: clickUrl || destination,
            terms: truncate(description, 2000),
            startDate: parseDate(xmlTag(b, 'promotion-start-date')),
            expiryDate: parseDate(xmlTag(b, 'promotion-end-date')),
            sector: xmlTag(b, 'category'),
          })
        }
        yield { coupons, raw: blocks.length }

        const total = Number(body.match(/total-matched="(\d+)"/)?.[1])
        const done = blocks.length < CJ_PAGE_SIZE || (Number.isFinite(total) && page * CJ_PAGE_SIZE >= total)
        await sleep(CJ_DELAY_MS)
        if (done) break
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* Takeads: GET /v1/product/monetize-api/v1/coupon (+ v2/merchant)      */
/* ------------------------------------------------------------------ */

const TAKEADS_API = 'https://api.takeads.com/v1/product/monetize-api'

/** Merchant ID → name & domain. Coupons only carry merchantId. */
async function fetchTakeadsMerchants(publicKey: string) {
  const merchants = new Map<number, { name: string; domain: string }>()
  let next = ''
  for (;;) {
    const res = await fetch(`${TAKEADS_API}/v2/merchant?limit=${TAKEADS_PAGE_SIZE}${next ? `&next=${next}` : ''}`, {
      headers: { Authorization: `Bearer ${publicKey}` },
    })
    if (!res.ok) throw new Error(`Takeads merchant API ${res.status}: ${(await res.text()).slice(0, 1000)}`)
    const json = await res.json()
    const items: any[] = Array.isArray(json?.data) ? json.data : []
    for (const m of items) {
      if (m?.merchantId != null) merchants.set(m.merchantId, { name: String(m.name || ''), domain: String(m.defaultDomain || '') })
    }
    next = json?.meta?.next
    if (!next || !items.length) return merchants
    await sleep(TAKEADS_DELAY_MS)
  }
}

async function* fetchTakeads(publicKey: string, regions: string[]) {
  const merchants = await fetchTakeadsMerchants(publicKey)
  let next = ''
  for (;;) {
    const params = new URLSearchParams({ limit: String(TAKEADS_PAGE_SIZE) })
    if (regions.length) params.set('countryCodes', regions.join(','))
    if (next) params.set('next', next)
    const res = await fetch(`${TAKEADS_API}/v1/coupon?${params}`, { headers: { Authorization: `Bearer ${publicKey}` } })
    if (!res.ok) throw new Error(`Takeads coupon API ${res.status}: ${(await res.text()).slice(0, 1000)}`)
    const json = await res.json()
    const items: any[] = Array.isArray(json?.data) ? json.data : []

    const coupons: NormalizedCoupon[] = []
    for (const c of items) {
      // The feed keeps old offers; only active ones in a target country, in English.
      if (!c?.couponId || !c.isActive || !c.trackingLink) continue
      const countries: string[] = (c.countryCodes || []).map((x: string) => String(x).toUpperCase())
      if (regions.length && !countries.some((x) => regions.includes(x))) continue
      const langs: string[] = (c.languageCodes || []).map((x: string) => String(x).toLowerCase())
      if (regions.length && langs.length && !langs.includes('en')) continue
      const merchant = merchants.get(c.merchantId)
      if (!merchant?.name || !c.name) continue
      coupons.push({
        externalId: `takeads:${c.couponId}`,
        title: truncate(String(c.name), 250)!,
        storeName: merchant.name,
        advertiserId: String(c.merchantId),
        advertiserJoined: true, // Takeads monetises any merchant in its catalogue
        code: typeof c.code === 'string' && c.code.trim() ? c.code.trim() : null,
        discountText: extractDiscountText(`${c.name} ${c.description || ''}`),
        destinationUrl: merchant.domain && merchant.domain !== 'unknown.host' ? `https://${merchant.domain}` : c.trackingLink,
        affiliateUrl: c.trackingLink,
        terms: truncate(c.description, 2000),
        startDate: parseDate(c.startDate),
        expiryDate: parseDate(c.endDate),
        // No category names in the Takeads API; the merchant domain helps brand matching.
        sector: merchant.domain,
      })
    }
    yield { coupons, raw: items.length }

    next = json?.meta?.next
    if (!next || !items.length) return
    await sleep(TAKEADS_DELAY_MS)
  }
}

/* ------------------------------------------------------------------ */
/* Impact: GET /Mediapartners/{sid}/Campaigns + /Ads                   */
/* ------------------------------------------------------------------ */

const IMPACT_DELAY_MS = 600

// Impact's ShippingRegions use country names; map the ISO codes used in feed settings.
const IMPACT_REGION_NAMES: Record<string, string> = {
  US: 'US', GB: 'UK', CA: 'CANADA', AU: 'AUSTRALIA', NZ: 'NEWZEALAND', IE: 'IRELAND', DE: 'GERMANY', FR: 'FRANCE',
  ES: 'SPAIN', IT: 'ITALY', NL: 'NETHERLANDS', SE: 'SWEDEN', SG: 'SINGAPORE', IN: 'INDIA', JP: 'JAPAN', MX: 'MEXICO',
}

function impactDiscountText(ad: any): string | null {
  if (ad.DiscountPercent) return `${ad.DiscountPercent}% OFF`
  if (ad.DiscountAmount) return `${ad.DiscountCurrency === 'USD' || !ad.DiscountCurrency ? '$' : `${ad.DiscountCurrency} `}${ad.DiscountAmount} OFF`
  return extractDiscountText(`${ad.DealName || ''} ${ad.Name || ''} ${ad.DealDescription || ''}`)
}

async function* fetchImpact(accountSid: string, authToken: string, regions: string[]) {
  const base = `https://api.impact.com/Mediapartners/${accountSid}`
  const headers = {
    Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
    Accept: 'application/json',
  }
  const get = async (path: string) => {
    const res = await fetch(base + path, { headers })
    if (!res.ok) throw new Error(`Impact API ${res.status}: ${(await res.text()).slice(0, 1000)}`)
    return res.json()
  }

  // Programs you're accepted into, with the countries they ship to.
  const shipsTo = new Map<string, string[]>()
  for (let page = 1; ; page++) {
    const json = await get(`/Campaigns?PageSize=100&Page=${page}`)
    for (const c of json?.Campaigns || []) {
      shipsTo.set(String(c.CampaignId), (c.ShippingRegions || []).map((r: string) => String(r).toUpperCase()).filter(Boolean))
    }
    if (!json?.['@nextpageuri']) break
    await sleep(IMPACT_DELAY_MS)
  }
  const wanted = regions.map((r) => IMPACT_REGION_NAMES[r] || r)

  // Ads carry the tracking link; only active deals and coupon ads are offers.
  for (let page = 1; ; page++) {
    const json = await get(`/Ads?PageSize=100&Page=${page}`)
    const items: any[] = json?.Ads || []
    const coupons: NormalizedCoupon[] = []
    for (const ad of items) {
      const isDeal = ad.DealId && ad.DealState === 'ACTIVE'
      if (!isDeal && ad.Type !== 'COUPON') continue
      if (!ad.TrackingLink) continue
      if (regions.length) {
        const ships = shipsTo.get(String(ad.CampaignId)) || []
        if (!ships.some((r) => wanted.includes(r))) continue
        if (ad.Language && !String(ad.Language).toUpperCase().startsWith('EN')) continue
      }
      const title = String(ad.DealName || ad.Name || '').trim()
      if (!title) continue
      const code = String(ad.DealDefaultPromoCode || '').trim() || null
      coupons.push({
        // Several ads can point at the same deal; key by deal so it's imported once.
        externalId: ad.DealId ? `impact:deal:${ad.DealId}` : `impact:ad:${ad.Id}`,
        title: truncate(title, 250)!,
        storeName: String(ad.AdvertiserName || ad.CampaignName || 'Unknown'),
        advertiserId: String(ad.AdvertiserId || ''),
        advertiserJoined: true, // the Partner API only returns programs you've been accepted into
        code,
        discountText: impactDiscountText(ad),
        destinationUrl: ad.LandingPageUrl || ad.TrackingLink,
        affiliateUrl: ad.TrackingLink,
        terms: truncate(ad.DealDescription || ad.Description, 2000),
        startDate: parseDate(ad.DealStartDate || ad.StartDate),
        expiryDate: parseDate(ad.DealEndDate || ad.EndDate),
        sector: '', // Impact has no sector field; matching uses the advertiser name
      })
    }
    yield { coupons, raw: items.length }
    if (!json?.['@nextpageuri'] || !items.length) return
    await sleep(IMPACT_DELAY_MS)
  }
}

/* ------------------------------------------------------------------ */
/* Upsert + expiry                                                     */
/* ------------------------------------------------------------------ */

async function loadExisting(payload: Payload, network: ImportNetwork) {
  const res = await payload.find({
    collection: 'affiliate-coupons',
    where: { and: [{ network: { equals: network } }, { externalId: { exists: true } }] },
    pagination: false,
    depth: 0,
    select: {
      externalId: true,
      title: true,
      code: true,
      affiliateUrl: true,
      expiryDate: true,
      terms: true,
      isActive: true,
      siteCategory: true,
      siteCategoryLocked: true,
    },
  })
  const map = new Map<string, ExistingCoupon>()
  for (const doc of res.docs as any[]) {
    if (doc.externalId) map.set(doc.externalId, doc)
  }
  return map
}

function hasChanged(existing: ExistingCoupon, c: CouponData): boolean {
  return (
    (existing.siteCategory ?? null) !== c.siteCategory ||
    existing.title !== c.title ||
    (existing.code || null) !== c.code ||
    existing.affiliateUrl !== c.affiliateUrl ||
    (existing.terms || null) !== c.terms ||
    (existing.expiryDate ? new Date(existing.expiryDate).toISOString() : null) !== c.expiryDate ||
    existing.isActive === false
  )
}

async function getCouponFeed(payload: Payload, network: ImportNetwork) {
  const res = await payload.find({
    collection: 'affiliate-feeds',
    where: { and: [{ network: { equals: network } }, { feedType: { equals: 'coupons' } }] },
    limit: 1,
    depth: 0,
  })
  return res.docs[0] || null
}

async function importNetwork(payload: Payload, network: ImportNetwork, runStart: Date): Promise<NetworkImportResult> {
  const result: NetworkImportResult = {
    network,
    ok: false,
    fetched: 0,
    added: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    deactivated: 0,
  }

  const creds = (
    await payload.find({
      collection: 'affiliate-networks',
      where: { networkType: { equals: network } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
  ).docs[0] as any

  let feed = await getCouponFeed(payload, network)
  if (!feed) {
    feed = await payload.create({
      collection: 'affiliate-feeds',
      data: {
        feedName: `${{ cj: 'CJ Affiliate', awin: 'Awin Network', takeads: 'Takeads', impact: 'Impact' }[network]} — Coupons & Promo Codes Feed`,
        network,
        feedType: 'coupons',
        advertiserScope: 'all_advertisers',
        status: 'SYNCING',
      },
    })
  }
  const approvedOnly = feed.advertiserScope === 'approved_only'
  const regions = ((feed as any).regions || '')
    .split(',')
    .map((r: string) => r.trim().toUpperCase())
    .filter((r: string) => /^[A-Z]{2}$/.test(r))

  if (feed.status === 'PAUSED') {
    result.ok = true
    result.error = 'Feed is paused'
    return result
  }

  await payload.update({ collection: 'affiliate-feeds', id: feed.id, data: { status: 'SYNCING', lastError: null } })

  try {
    let source: AsyncGenerator<{ coupons: NormalizedCoupon[]; raw: number }>
    if (network === 'awin') {
      if (!creds?.publisherId || !creds?.apiToken) throw new Error('Awin Publisher ID and API token are required.')
      source = fetchAwin(creds.publisherId, creds.apiToken, approvedOnly ? 'joined' : 'all', regions)
    } else if (network === 'impact') {
      if (!creds?.publisherId || !creds?.apiToken) throw new Error('Impact Account SID and Auth Token are required.')
      source = fetchImpact(creds.publisherId, creds.apiToken, regions)
    } else if (network === 'takeads') {
      if (!creds?.publishKey) throw new Error('Takeads Publish Key is required (it is the API public key).')
      source = fetchTakeads(creds.publishKey, regions)
    } else {
      if (!creds?.websiteId || !creds?.apiToken)
        throw new Error('CJ Website ID (PID) and Personal Access Token are required.')
      source = fetchCj(creds.websiteId, creds.apiToken, approvedOnly ? ['joined'] : ['joined', 'notjoined'], regions)
    }

    const filter = await buildOfferFilter(payload, feed as any)
    const existing = await loadExisting(payload, network)
    const seenThisRun = new Set<string>()
    const perAdvertiser = new Map<string, number>()
    const nowIso = runStart.toISOString()

    for await (const page of source) {
      result.fetched += page.raw
      result.skipped += page.raw - page.coupons.length
      const unchangedIds: number[] = []

      for (const c of page.coupons) {
        if (seenThisRun.has(c.externalId)) continue // same link returned under two promotion types
        seenThisRun.add(c.externalId)

        if (isExpired(c.expiryDate)) {
          result.skipped++
          continue
        }

        const match = filter.classify({
          advertiserId: c.advertiserId,
          advertiserName: c.storeName,
          sector: c.sector,
          text: `${c.title} ${c.terms || ''}`,
        })
        if (!match) {
          result.skipped++
          continue
        }
        const advertiserCount = perAdvertiser.get(c.advertiserId) || 0
        if (advertiserCount >= MAX_PER_ADVERTISER) {
          result.skipped++
          continue
        }
        perAdvertiser.set(c.advertiserId, advertiserCount + 1)
        const { sector: _sector, ...fields } = c
        const data: CouponData = { ...fields, siteCategory: match.categoryId }

        try {
          const prev = existing.get(c.externalId)
          // Categories changed by hand in the admin are locked and kept.
          if (prev?.siteCategoryLocked) data.siteCategory = prev.siteCategory ?? null
          if (!prev) {
            const created = await payload.create({
              collection: 'affiliate-coupons',
              data: { ...data, network, isActive: true, lastSeenAt: nowIso },
            })
            existing.set(c.externalId, { id: created.id as number, ...data, isActive: true })
            result.added++
          } else if (hasChanged(prev, data)) {
            await payload.update({
              collection: 'affiliate-coupons',
              id: prev.id,
              data: { ...data, isActive: true, lastSeenAt: nowIso },
            })
            result.updated++
          } else {
            unchangedIds.push(prev.id)
          }
        } catch (err) {
          result.failed++
          payload.logger.warn(`[couponImporter] ${c.externalId}: ${(err as Error).message}`)
        }
      }

      if (unchangedIds.length) {
        await payload.db.drizzle.execute(
          sql`UPDATE affiliate_coupons SET last_seen_at = ${nowIso} WHERE id IN (${sql.join(
            unchangedIds.map((id) => sql`${id}`),
            sql`, `,
          )})`,
        )
      }
    }

    // Offers no longer in the feed have expired or been withdrawn by the advertiser.
    const deactivated: any = await payload.db.drizzle.execute(sql`
      UPDATE affiliate_coupons SET is_active = false, updated_at = now()
      WHERE network = ${network} AND external_id IS NOT NULL AND is_active = true
        AND (last_seen_at IS NULL OR last_seen_at < ${nowIso})
    `)
    result.deactivated = deactivated?.rowCount ?? 0
    result.ok = true

    await payload.update({
      collection: 'affiliate-feeds',
      id: feed.id,
      data: {
        status: 'ACTIVE',
        lastSync: new Date().toISOString(),
        addedCount: result.added,
        updatedCount: result.updated,
        skippedCount: result.skipped,
        failedCount: result.failed,
        lastError: null,
      },
    })
  } catch (err) {
    result.error = (err as Error).message
    payload.logger.error(`[couponImporter] ${network} import failed: ${result.error}`)
    await payload.update({
      collection: 'affiliate-feeds',
      id: feed.id,
      data: {
        status: 'ERROR',
        lastSync: new Date().toISOString(),
        addedCount: result.added,
        updatedCount: result.updated,
        skippedCount: result.skipped,
        failedCount: result.failed,
        lastError: result.error,
      },
    })
  }

  return result
}

/** Deactivate expired coupons and delete old inactive imported ones. Safe to run on its own. */
export async function sweepExpiredCoupons(payload: Payload) {
  const expired: any = await payload.db.drizzle.execute(sql`
    UPDATE affiliate_coupons SET is_active = false, updated_at = now()
    WHERE is_active = true AND expiry_date IS NOT NULL AND expiry_date < now()
  `)
  const purged: any = await payload.db.drizzle.execute(sql`
    DELETE FROM affiliate_coupons
    WHERE external_id IS NOT NULL AND is_active = false
      AND updated_at < now() - make_interval(days => ${RETENTION_DAYS})
  `)
  return { expiredDeactivated: expired?.rowCount ?? 0, purged: purged?.rowCount ?? 0 }
}

const running = new Map<ImportNetwork, Promise<NetworkImportResult>>()

/** With no argument: whether any network is importing in this process. */
export function isCouponImportRunning(network?: ImportNetwork) {
  return network ? running.has(network) : running.size > 0
}

/**
 * Imports the given networks one after another, then runs the expiry sweep.
 * Each network has its own lock, so e.g. CJ can sync while Awin is still running. A network already
 * importing in this process is joined rather than restarted; one importing in another process
 * (cron vs admin button) is skipped.
 */
export async function importAllCoupons(
  payload: Payload,
  networks: ImportNetwork[] = IMPORT_NETWORKS,
): Promise<ImportResult> {
  const runStart = new Date()
  const results: NetworkImportResult[] = []

  for (const network of networks) {
    const inProcess = running.get(network)
    if (inProcess) {
      results.push(await inProcess)
      continue
    }
    const feed = await getCouponFeed(payload, network)
    const busyElsewhere =
      feed?.status === 'SYNCING' && Date.now() - new Date(feed.updatedAt).getTime() < STALE_LOCK_MS
    if (busyElsewhere) continue

    const run = importNetwork(payload, network, new Date()).finally(() => running.delete(network))
    running.set(network, run)
    results.push(await run)
  }

  const sweep = await sweepExpiredCoupons(payload)
  const summary: ImportResult = {
    startedAt: runStart.toISOString(),
    finishedAt: new Date().toISOString(),
    networks: results,
    ...sweep,
  }
  payload.logger.info(`[couponImporter] ${JSON.stringify(summary)}`)
  return summary
}
