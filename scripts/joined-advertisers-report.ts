/** Read-only: lists advertisers you're joined to on Awin and CJ (names only) that match creator-gear keywords. */
import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

const KEYWORDS = /riverside|descript|canva|adobe|shure|rode|elgato|focusrite|blue mic|audio-technica|sennheiser|logitech|sony|canon|nikon|panasonic|blackmagic|dji|gopro|godox|neewer|aputure|manfrotto|lume|epidemic|artlist|storyblocks|shutterstock|envato|tubebuddy|vidiq|camera|photo|video|audio|studio|lighting|microphone|headphone|b&h|adorama|sweetwater|guitar center|best buy|amazon|newegg|dell|lenovo|hp|apple|samsung|elgato|corsair|razer|wacom|huion|monitor|desk|chair|herman|steelcase|secretlab|autonomous|uplift|flexispot|fully|ergonomic/i

async function main() {
  const payload = await getPayload({ config: configPromise })
  const get = async (nt: string) => (await payload.find({ collection: 'affiliate-networks', where: { networkType: { equals: nt } }, limit: 1, overrideAccess: true })).docs[0] as any
  const awin = await get('awin'), cj = await get('cj'), impact = await get('impact')

  const r = await fetch(`https://api.awin.com/publishers/${awin.publisherId}/programmes?relationship=joined`, { headers: { Authorization: `Bearer ${awin.apiToken}` } })
  const list: any[] = await r.json()
  console.log(`AWIN joined: ${list.length}`)
  console.log(' matches:', JSON.stringify(list.filter((p) => KEYWORDS.test(`${p.name} ${p.primarySector}`)).map((p) => `${p.name} [${p.primarySector}, ${p.primaryRegion?.countryCode}]`)))
  console.log(' all names:', list.map((p) => p.name).join(' | ').slice(0, 1500))

  const q = `{ publisherCommissions(forPublishers: ["${cj.publisherId}"], sincePostingDate: "2026-01-01T00:00:00Z", beforePostingDate: "2026-09-29T00:00:00Z") { count } }`
  // CJ: joined advertisers via Advertiser Lookup (REST, XML)
  const params = new URLSearchParams({ 'requestor-cid': cj.publisherId, 'advertiser-ids': 'joined', 'records-per-page': '100' })
  const cr = await fetch(`https://advertiser-lookup.api.cj.com/v2/advertiser-lookup?${params}`, { headers: { Authorization: `Bearer ${cj.apiToken}` } })
  const xml = await cr.text()
  const names = [...xml.matchAll(/<advertiser-name>([\s\S]*?)<\/advertiser-name>/g)].map((m) => m[1])
  const total = xml.match(/total-matched="(\d+)"/)?.[1]
  console.log(`CJ joined (HTTP ${cr.status}): total ${total}, page ${names.length}`)
  console.log(' matches:', JSON.stringify(names.filter((n) => KEYWORDS.test(n))))
  console.log(' names:', names.join(' | ').slice(0, 1200))
  void q, impact
  process.exit(0)
}
main().catch((e) => { console.error(e.message); process.exit(1) })
