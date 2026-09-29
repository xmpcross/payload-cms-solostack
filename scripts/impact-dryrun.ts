/** Read-only: lists the Impact deals/coupons a sync would consider for the US, before category filtering. */
import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })
  const net: any = (await payload.find({ collection: 'affiliate-networks', where: { networkType: { equals: 'impact' } }, limit: 1, overrideAccess: true })).docs[0]
  const h = { Authorization: `Basic ${Buffer.from(`${net.publisherId}:${net.apiToken}`).toString('base64')}`, Accept: 'application/json' }
  const base = `https://api.impact.com/Mediapartners/${net.publisherId}`
  const camps: any = await (await fetch(`${base}/Campaigns?PageSize=100`, { headers: h })).json()
  const ships = new Map<string, string[]>()
  for (const c of camps.Campaigns) ships.set(String(c.CampaignId), c.ShippingRegions || [])
  const rows = new Map<string, any>()
  for (let page = 1; page <= 7; page++) {
    const j: any = await (await fetch(`${base}/Ads?PageSize=100&Page=${page}`, { headers: h })).json()
    for (const ad of j.Ads || []) {
      const isDeal = ad.DealId && ad.DealState === 'ACTIVE'
      if (!isDeal && ad.Type !== 'COUPON') continue
      const us = (ships.get(String(ad.CampaignId)) || []).includes('US')
      rows.set(ad.DealId ? `d${ad.DealId}` : `a${ad.Id}`, { adv: ad.AdvertiserName, camp: ad.CampaignName, us, code: ad.DealDefaultPromoCode || '', name: (ad.DealName || ad.Name || '').slice(0, 50), lang: ad.Language })
    }
    if (!j['@nextpageuri']) break
    await new Promise((r) => setTimeout(r, 600))
  }
  const all = [...rows.values()]
  console.log('deal/coupon offers total:', all.length, '| US-shipping:', all.filter((r) => r.us).length)
  const byAdv = new Map<string, number>()
  for (const r of all.filter((r) => r.us)) byAdv.set(`${r.adv} (${r.code ? 'code' : 'no code'})`, (byAdv.get(`${r.adv} (${r.code ? 'code' : 'no code'})`) || 0) + 1)
  console.log('US by advertiser:', JSON.stringify([...byAdv]))
  for (const r of all.filter((r) => r.us).slice(0, 12)) console.log(' -', r.adv, '|', r.name, '|', r.code || '(no code)', '|', r.lang)
  const nonUs = new Map<string, number>()
  for (const r of all.filter((r) => !r.us)) nonUs.set(r.camp, (nonUs.get(r.camp) || 0) + 1)
  console.log('non-US by campaign:', JSON.stringify([...nonUs]))
  process.exit(0)
}
main().catch((e) => { console.error(e.message); process.exit(1) })
