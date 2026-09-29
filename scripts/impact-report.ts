/** Prints Impact Partner API response shapes (campaigns, deals, promo codes, ads) using saved credentials. */
import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

const shape = (o: any) =>
  JSON.stringify(Object.fromEntries(Object.entries(o || {}).map(([k, v]) => [k, Array.isArray(v) ? `array(${v.length})` : v && typeof v === 'object' ? `{${Object.keys(v).join(',')}}` : typeof v === 'string' && /url|link|uri/i.test(k) ? '(url)' : v])))

async function main() {
  const payload = await getPayload({ config: configPromise })
  const net: any = (await payload.find({ collection: 'affiliate-networks', where: { networkType: { equals: 'impact' } }, limit: 1, overrideAccess: true })).docs[0]
  const sid = net.publisherId
  const headers = { Authorization: `Basic ${Buffer.from(`${sid}:${net.apiToken}`).toString('base64')}`, Accept: 'application/json' }
  const base = `https://api.impact.com/Mediapartners/${sid}`
  const get = async (path: string) => {
    const res = await fetch(base + path, { headers })
    const text = await res.text()
    let json: any = null
    try { json = JSON.parse(text) } catch {}
    return { status: res.status, json, text }
  }

  const camp = await get('/Campaigns?PageSize=100')
  console.log('Campaigns', camp.status, camp.json ? Object.keys(camp.json).filter((k) => k.startsWith('@')).map((k) => `${k}=${camp.json[k]}`).join(' ') : camp.text.slice(0, 200))
  const campaigns: any[] = camp.json?.Campaigns || []
  if (campaigns[0]) console.log(' campaign fields:', shape(campaigns[0]))
  const status = new Map<string, number>()
  for (const c of campaigns) status.set(c.ContractStatus, (status.get(c.ContractStatus) || 0) + 1)
  console.log(' contract status:', JSON.stringify([...status]))

  for (const path of ['/Deals?PageSize=5', '/PromoCodes?PageSize=5', '/Ads?PageSize=5&Type=COUPON', '/Ads?PageSize=5']) {
    const r = await get(path)
    const listKey = r.json ? Object.keys(r.json).find((k) => Array.isArray(r.json[k])) : undefined
    console.log(path, r.status, r.json ? `${Object.keys(r.json).filter((k) => k.startsWith('@')).map((k) => `${k}=${r.json[k]}`).join(' ')} list=${listKey}` : r.text.slice(0, 150))
    if (listKey && r.json[listKey][0]) console.log('  fields:', shape(r.json[listKey][0]).slice(0, 900))
    await new Promise((res) => setTimeout(res, 800))
  }
  for (const c of campaigns) console.log(' campaign:', c.AdvertiserName, '|', c.CampaignName, '| ships:', JSON.stringify(c.ShippingRegions))
  // All ad fields for one coupon ad
  const coupon = await get('/Ads?PageSize=1&Type=COUPON')
  const a = coupon.json?.Ads?.[0]
  if (a) console.log('COUPON AD KEYS', Object.keys(a).join(', '))
  if (a) console.log('COUPON AD deal fields', JSON.stringify(Object.fromEntries(Object.entries(a).filter(([k]) => /^(Deal|Discount|Default|Promo|Minimum|Maximum|Gift|Rebate|Bogo|Start|End|Language|Type|Code)/.test(k) && !/Code$/.test(k) || k === 'Code'))))
  // Deals across campaigns
  let dealTotal = 0, activeDeals = 0, withCode = 0
  let sample: any = null
  for (const c of campaigns) {
    const r = await get(`/Campaigns/${c.CampaignId}/Deals?PageSize=100`)
    for (const d of r.json?.Deals || []) {
      dealTotal++
      if (d.State === 'ACTIVE' || d.DealState === 'ACTIVE') activeDeals++
      if (d.DefaultPromoCode || d.PromoCode) withCode++
      if (!sample) sample = d
    }
    await new Promise((res) => setTimeout(res, 500))
  }
  console.log('DEALS total', dealTotal, 'active', activeDeals, 'with code', withCode)
  if (sample) console.log('DEAL KEYS', Object.keys(sample).join(', '))
  if (sample) console.log('DEAL sample', shape(sample).slice(0, 900))
  // Ads with a DealId
  let adsWithDeal = 0, adsTotal = 0
  for (let page = 1; page <= 7; page++) {
    const r = await get(`/Ads?PageSize=100&Page=${page}`)
    for (const ad of r.json?.Ads || []) { adsTotal++; if (ad.DealId) adsWithDeal++ }
    if (!r.json?.['@nextpageuri']) break
    await new Promise((res) => setTimeout(res, 500))
  }
  console.log('ADS total', adsTotal, 'with DealId', adsWithDeal)
  process.exit(0)
}
main().catch((e) => { console.error(e.message); process.exit(1) })
