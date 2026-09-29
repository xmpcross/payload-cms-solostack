/** Prints the Takeads coupon API response shape (field names, counts) using the saved Takeads key. */
import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })
  const net: any = (
    await payload.find({ collection: 'affiliate-networks', where: { networkType: { equals: 'takeads' } }, limit: 1, overrideAccess: true })
  ).docs[0]
  for (const [label, key] of [['accountApiKey', net?.accountApiKey], ['publishKey', net?.publishKey], ['apiToken', net?.apiToken]] as const) {
    if (!key) { console.log(label, 'not set'); continue }
    const res = await fetch('https://api.takeads.com/v1/product/monetize-api/v1/coupon?limit=5', {
      headers: { Authorization: `Bearer ${key}` },
    })
    const text = await res.text()
    console.log(label, 'HTTP', res.status)
    try {
      const json = JSON.parse(text)
      console.log(' top-level keys:', Object.keys(json))
      if (json.errors) console.log(' errors:', JSON.stringify(json.errors).slice(0, 300))
      const first = Array.isArray(json.data) ? json.data[0] : undefined
      if (first) {
        console.log(' coupon fields:', JSON.stringify(Object.fromEntries(Object.entries(first).map(([k, v]) => [k, Array.isArray(v) ? `array(${v.length})` : typeof v === 'object' && v ? `{${Object.keys(v).join(',')}}` : typeof v]))))
        console.log(' sample (non-link fields):', JSON.stringify({ name: first.name, countryCodes: first.countryCodes, languageCodes: first.languageCodes, categoryIds: first.categoryIds, endDate: first.endDate }))
      }
      if (json.meta) console.log(' meta:', JSON.stringify(json.meta))
    } catch {
      console.log(' body:', text.slice(0, 200))
    }
    if (res.ok) break
  }
  process.exit(0)
}
main().catch((e) => { console.error(e.message); process.exit(1) })
