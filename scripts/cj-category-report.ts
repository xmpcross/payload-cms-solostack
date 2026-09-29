/** Prints CJ Link Search field names and coupon-link counts by category / language (for tuning filters). */
import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })
  const net: any = (
    await payload.find({ collection: 'affiliate-networks', where: { networkType: { equals: 'cj' } }, limit: 1, overrideAccess: true })
  ).docs[0]
  const cats = new Map<string, number>()
  const langs = new Map<string, number>()
  let fields = new Set<string>()
  const countries = new Map<string, number>()
  const rel = process.argv.includes('--notjoined') ? 'notjoined' : 'joined'
  for (let page = 1; page <= 10; page++) {
    const params = new URLSearchParams({
      'website-id': net.websiteId, 'advertiser-ids': rel, 'promotion-type': 'coupon',
      'records-per-page': '100', 'page-number': String(page),
    })
    const body = await (await fetch(`https://link-search.api.cj.com/v2/link-search?${params}`, {
      headers: { Authorization: `Bearer ${net.apiToken}` },
    })).text()
    const links = body.match(/<link>[\s\S]*?<\/link>/g) || []
    if (page === 1 && links[0]) fields = new Set([...links[0].matchAll(/<([a-z-]+)>/gi)].map((m) => m[1]))
    for (const l of links) {
      const cat = l.match(/<category>([\s\S]*?)<\/category>/)?.[1] || '(none)'
      const lang = l.match(/<language>([\s\S]*?)<\/language>/)?.[1] || '(none)'
      cats.set(cat, (cats.get(cat) || 0) + 1)
      const tc = l.match(/<targeted-countries>([\s\S]*?)<\/targeted-countries>/)?.[1] || '(none)'
      countries.set(tc, (countries.get(tc) || 0) + 1)
      langs.set(lang, (langs.get(lang) || 0) + 1)
    }
    if (links.length < 100) break
    await new Promise((r) => setTimeout(r, 2600))
  }
  console.log('FIELDS', [...fields].join(', '))
  console.log('TARGETED-COUNTRIES', JSON.stringify([...countries].sort((a, b) => b[1] - a[1]).slice(0, 20)))
  console.log('LANGUAGES', JSON.stringify([...langs].sort((a, b) => b[1] - a[1])))
  console.log('CATEGORIES'); for (const [c, n] of [...cats].sort((a, b) => b[1] - a[1]).slice(0, 60)) console.log(`${n}\t${c}`)
  process.exit(0)
}
main().catch((e) => { console.error(e.message); process.exit(1) })
