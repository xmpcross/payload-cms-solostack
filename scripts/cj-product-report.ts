/** Read-only: CJ product feed sizes per joined advertiser (no data is imported). */
import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })
  const net: any = (await payload.find({ collection: 'affiliate-networks', where: { networkType: { equals: 'cj' } }, limit: 1, overrideAccess: true })).docs[0]
  // Advertisers your coupon filter accepts (matched a site category), from imported CJ coupons.
  const matched = new Set<string>()
  const cps = await payload.find({ collection: 'affiliate-coupons', where: { and: [{ network: { equals: 'cj' } }, { siteCategory: { exists: true } }] }, pagination: false, depth: 0, select: { advertiserId: true } })
  for (const c of cps.docs as any[]) if (c.advertiserId) matched.add(String(c.advertiserId))
  console.log('advertisers accepted by the category filter:', matched.size)

  const all: any[] = []
  const ids = [...matched]
  for (let i = 0; i < ids.length; i += 20) {
    const query = `{ shoppingProductFeeds(companyId: ${JSON.stringify(net.publisherId)}, partnerIds: ${JSON.stringify(ids.slice(i, i + 20))}, limit: 1000) { totalCount count resultList { advertiserId advertiserName productCount advertiserCountry language currency } } }`
    const res = await fetch('https://ads.api.cj.com/query', {
      method: 'POST',
      headers: { Authorization: `Bearer ${net.apiToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const text = await res.text()
    let json: any
    try { json = JSON.parse(text) } catch { console.log('non-JSON reply:', text.slice(0, 200)); break }
    if (json.errors) { console.log('error:', JSON.stringify(json.errors).slice(0, 300)); break }
    all.push(...(json.data.shoppingProductFeeds.resultList || []))
    await new Promise((r) => setTimeout(r, 2600))
  }
  const unique = new Set(all.map((f) => `${f.advertiserId}|${f.language}|${f.productCount}`))
  console.log('feed records fetched:', all.length, '(unique', unique.size + ')')
  const ours = all.filter((f) => matched.has(String(f.advertiserId)))
  const en = ours.filter((f) => /^en/i.test(f.language || ''))
  const sum = (l: any[]) => l.reduce((n, f) => n + (f.productCount || 0), 0)
  console.log('feeds from accepted advertisers:', ours.length, '| products:', sum(ours))
  console.log('  English only:', en.length, 'feeds |', sum(en), 'products')
  const byAdv = new Map<string, number>()
  for (const f of en) byAdv.set(f.advertiserName, (byAdv.get(f.advertiserName) || 0) + (f.productCount || 0))
  const rows = [...byAdv].sort((a, b) => b[1] - a[1])
  for (const [n, c] of rows.slice(0, 15)) console.log(String(c).padStart(9), n)
  for (const cap of [100, 500, 1000]) console.log(`with a cap of ${cap} per advertiser:`, rows.reduce((n, [, c]) => n + Math.min(c, cap), 0), 'products')
  process.exit(0)
}
main().catch((e) => { console.error(e.message); process.exit(1) })
