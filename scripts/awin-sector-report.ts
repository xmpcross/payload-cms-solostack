/** Prints Awin advertiser counts by primary sector and primary region (for tuning category keywords). */
import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })
  const net: any = (
    await payload.find({ collection: 'affiliate-networks', where: { networkType: { equals: 'awin' } }, limit: 1, overrideAccess: true })
  ).docs[0]
  const sectors = new Map<string, number>()
  const regions = new Map<string, number>()
  const usSectors = new Map<string, number>()
  for (const rel of ['joined', 'notjoined']) {
    const res = await fetch(`https://api.awin.com/publishers/${net.publisherId}/programmes?relationship=${rel}`, {
      headers: { Authorization: `Bearer ${net.apiToken}` },
    })
    const list: any[] = await res.json()
    for (const p of list) {
      const s = p.primarySector || '(none)'
      const r = p.primaryRegion?.countryCode || '(none)'
      sectors.set(s, (sectors.get(s) || 0) + 1)
      regions.set(r, (regions.get(r) || 0) + 1)
      if (r === 'US') usSectors.set(s, (usSectors.get(s) || 0) + 1)
    }
    await new Promise((r) => setTimeout(r, 3200))
  }
  const top = (m: Map<string, number>, n: number) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n)
  console.log('REGIONS', JSON.stringify(top(regions, 15)))
  console.log('US SECTORS'); for (const [s, c] of top(usSectors, 80)) console.log(`${c}\t${s}`)
  process.exit(0)
}
main().catch((e) => { console.error(e.message); process.exit(1) })
