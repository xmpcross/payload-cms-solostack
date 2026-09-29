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

export type ImportNetwork = 'awin' | 'cj'

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
const CJ_PROMOTION_TYPES = ['coupon', 'sale/discount', 'free shipping']
const STALE_LOCK_MS = 3 * 60 * 60 * 1000

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

/** Advertiser ID → primarySector, from GET /publishers/{id}/programmes. */
async function fetchAwinSectors(publisherId: string, token: string, membership: 'all' | 'joined') {
  const sectors = new Map<string, string>()
  const relationships = membership === 'all' ? ['joined', 'notjoined'] : ['joined']
  for (const relationship of relationships) {
    const res = await fetch(`https://api.awin.com/publishers/${publisherId}/programmes?relationship=${relationship}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Awin programmes API ${res.status}: ${(await res.text()).slice(0, 300)}`)
    const list = await res.json()
    for (const p of Array.isArray(list) ? list : []) {
      if (p?.id != null) sectors.set(String(p.id), String(p.primarySector || ''))
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
      throw new Error(`Awin API ${res.status}: ${(await res.text()).slice(0, 300)}`)
    }
    const json = await res.json()
    const items: any[] = Array.isArray(json?.data) ? json.data : []

    const coupons: NormalizedCoupon[] = []
    for (const o of items) {
      if (!o?.promotionId || !o?.advertiser) continue
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
        sector: sectors.get(String(o.advertiser.id)) || '',
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
        if (regions.length) params.set('serviceable-area', regions.join(','))
        const res = await fetch(`https://link-search.api.cj.com/v2/link-search?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const body = await res.text()
        if (!res.ok || body.includes('<error-message>')) {
          throw new Error(`CJ API ${res.status}: ${(xmlTag(body, 'error-message') || body).slice(0, 300)}`)
        }

        const blocks = body.match(/<link>[\s\S]*?<\/link>/g) || []
        const coupons: NormalizedCoupon[] = []
        for (const b of blocks) {
          const linkId = xmlTag(b, 'link-id')
          const destination = xmlTag(b, 'destination')
          const clickUrl = xmlTag(b, 'clickUrl')
          const title = xmlTag(b, 'link-name') || xmlTag(b, 'description')
          if (!linkId || !title || !(destination || clickUrl)) continue
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
        feedName: `${network === 'cj' ? 'CJ Affiliate' : 'Awin Network'} — Coupons & Promo Codes Feed`,
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
    } else {
      if (!creds?.websiteId || !creds?.apiToken)
        throw new Error('CJ Website ID (PID) and Personal Access Token are required.')
      source = fetchCj(creds.websiteId, creds.apiToken, approvedOnly ? ['joined'] : ['joined', 'notjoined'], regions)
    }

    const filter = await buildOfferFilter(payload, feed as any)
    const existing = await loadExisting(payload, network)
    const seenThisRun = new Set<string>()
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

let running: Promise<ImportResult> | null = null

export function isCouponImportRunning() {
  return running !== null
}

/** Runs the import. Concurrent calls in the same process share one run; a run from another process is skipped. */
export function importAllCoupons(
  payload: Payload,
  networks: ImportNetwork[] = ['awin', 'cj'],
): Promise<ImportResult> {
  if (running) return running

  running = (async () => {
    const runStart = new Date()

    // Cross-process guard (e.g. cron + admin button): skip networks another process is still syncing.
    const toRun: ImportNetwork[] = []
    for (const network of networks) {
      const feed = await getCouponFeed(payload, network)
      const busy =
        feed?.status === 'SYNCING' && Date.now() - new Date(feed.updatedAt).getTime() < STALE_LOCK_MS
      if (!busy) toRun.push(network)
    }

    const results: NetworkImportResult[] = []
    for (const network of toRun) {
      results.push(await importNetwork(payload, network, runStart))
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
  })().finally(() => {
    running = null
  })

  return running
}
