/** Probes Takeads merchant/category endpoints (prints shapes only). */
import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })
  const net: any = (await payload.find({ collection: 'affiliate-networks', where: { networkType: { equals: 'takeads' } }, limit: 1, overrideAccess: true })).docs[0]
  const base = 'https://api.takeads.com/v1/product/monetize-api/v1'
  // country / language / category distribution over the first pages of the unfiltered feed
  const countries = new Map<string, number>(), langs = new Map<string, number>(), cats = new Map<string, number>()
  let next = '', total = 0
  let active = 0
  for (let i = 0; i < 30; i++) {
    const res = await fetch(`${base}/coupon?limit=100${next ? `&next=${next}` : ''}`, { headers: { Authorization: `Bearer ${net.publishKey}` } })
    const j: any = await res.json()
    if (i === 0 && !res.ok) console.log('page error', res.status, JSON.stringify(j).slice(0, 200))
    for (const c of j.data || []) {
      total++
      if (c.isActive) active++
      for (const x of c.countryCodes || []) countries.set(x, (countries.get(x) || 0) + 1)
      for (const x of c.languageCodes || []) langs.set(x, (langs.get(x) || 0) + 1)
      for (const x of c.categoryIds || []) cats.set(String(x), (cats.get(String(x)) || 0) + 1)
    }
    next = j.meta?.next
    if (!next || !(j.data || []).length) break
    await new Promise((r) => setTimeout(r, 1200))
  }
  const top = (m: Map<string, number>) => JSON.stringify([...m].sort((a, b) => b[1] - a[1]).slice(0, 15))
  console.log('scanned', total, 'active', active, 'more pages:', !!next)
  console.log('countries', top(countries)); console.log('languages', top(langs)); console.log('categoryIds', top(cats))
  process.exit(0)
}
main().catch((e) => { console.error(e.message); process.exit(1) })
