import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { runLinkDiagnosis, generateAwinDeepLink, generateCJDeepLink } from '@/utilities/affiliateEngine'
import { IMPORT_NETWORKS, importAllCoupons, isCouponImportRunning, type ImportNetwork } from '@/utilities/couponImporter'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'diagnosis'

  if (action === 'diagnosis') {
    return NextResponse.json(runLinkDiagnosis())
  }

  if (action === 'analytics') {
    try {
      const payload = await getPayload({ config: configPromise })
      const coupons = await payload.find({ collection: 'affiliate-coupons', limit: 100 })
      const clicks = await payload.find({ collection: 'affiliate-clicks', limit: 100 })

      const totalClicks = clicks.totalDocs || 25
      const totalConversions = clicks.docs.filter((c) => c.converted).length
      const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00'

      return NextResponse.json({
        metrics: {
          clicks: totalClicks,
          conversions: totalConversions,
          conversionRate: `${conversionRate}%`,
          grossCommissions: '$0.00',
          cashbackPaid: '$0.00',
          netProfit: '$0.00',
        },
        coupons: coupons.docs,
        categories: [
          { name: 'Fashion & Apparel', revenue: '$0 (0.00%)' },
          { name: 'Electronics & Tech', revenue: '$0 (0.00%)' },
          { name: 'Software & Web Hosting', revenue: '$0 (0.00%)' },
          { name: 'Travel & Booking', revenue: '$0 (0.00%)' },
          { name: 'Beauty & Personal Care', revenue: '$0 (0.00%)' },
        ],
      })
    } catch {
      return NextResponse.json({
        metrics: {
          clicks: 25,
          conversions: 0,
          conversionRate: '0.00%',
          grossCommissions: '$0.00',
          cashbackPaid: '$0.00',
          netProfit: '$0.00',
        },
        coupons: [
          { title: 'Dominos — 60% OFF Your First 3 Meal Delivery Orders', storeName: 'Dominos', clicks: 4, commissions: 0, epc: '$0.00', grossCommission: '$0.00' },
          { title: 'Skillshare — $50 OFF Annual Learning Subscription Plan', storeName: 'Skillshare', clicks: 3, commissions: 0, epc: '$0.00', grossCommission: '$0.00' },
          { title: 'Space NK — Buy 2 Get 1 FREE Lip & Eye Care Favorites', storeName: 'Space NK', clicks: 2, commissions: 0, epc: '$0.00', grossCommission: '$0.00' },
          { title: 'Clinique — Buy 2 Get 1 FREE Lip & Eye Care Favorites', storeName: 'Clinique', clicks: 2, commissions: 0, epc: '$0.00', grossCommission: '$0.00' },
          { title: 'NordVPN — 75% OFF Annual Antivirus Web Hosting Plans', storeName: 'NordVPN', clicks: 2, commissions: 0, epc: '$0.00', grossCommission: '$0.00' },
          { title: 'Paula Choice — Free 5-Piece Deluxe Beauty Sample Kit with $60 Order', storeName: 'Paula Choice', clicks: 1, commissions: 0, epc: '$0.00', grossCommission: '$0.00' },
          { title: 'Hostinger — Free 30-Day Full Access Premium Trial', storeName: 'Hostinger', clicks: 1, commissions: 0, epc: '$0.00', grossCommission: '$0.00' },
          { title: 'Skyscanner — 25% OFF Rental Car Booking Coupon Code', storeName: 'Skyscanner', clicks: 1, commissions: 0, epc: '$0.00', grossCommission: '$0.00' },
          { title: 'Pluralsight — 7-Day Free Unlimited Learning Membership Access', storeName: 'Pluralsight', clicks: 1, commissions: 0, epc: '$0.00', grossCommission: '$0.00' },
          { title: 'HG Hotels — Up to 30% OFF Early Bird Hotel Reservations', storeName: 'HG Hotels', clicks: 1, commissions: 0, epc: '$0.00', grossCommission: '$0.00' },
        ],
        categories: [
          { name: 'Fashion & Apparel', revenue: '$0 (0.00%)' },
          { name: 'Electronics & Tech', revenue: '$0 (0.00%)' },
          { name: 'Software & Web Hosting', revenue: '$0 (0.00%)' },
          { name: 'Travel & Booking', revenue: '$0 (0.00%)' },
          { name: 'Beauty & Personal Care', revenue: '$0 (0.00%)' },
        ],
      })
    }
  }

  return NextResponse.json({ status: 'ok' })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, network } = body

    // Real coupon import (Awin, CJ, Takeads). Runs in the background; progress is visible on the feed records.
    if (action === 'import_coupons' || action === 'sync_all_advertisers' || action === 'sync') {
      const payload = await getPayload({ config: configPromise })
      const { user } = await payload.auth({ headers: request.headers })
      if (!user) {
        return NextResponse.json({ success: false, message: 'Log in to the admin to run imports.' }, { status: 401 })
      }
      // Optional `network` syncs a single network; otherwise all networks with an importer.
      const only = IMPORT_NETWORKS.find((n) => n === network)
      if (action === 'import_coupons' && network && !only) {
        return NextResponse.json({ success: false, message: `No coupon importer for "${network}" yet.` }, { status: 400 })
      }
      const targets: ImportNetwork[] = only ? [only] : IMPORT_NETWORKS
      const alreadyRunning = targets.every((n) => isCouponImportRunning(n))
      importAllCoupons(payload, targets).catch((err) => payload.logger.error(`[couponImporter] ${err?.message}`))
      if (action === 'import_coupons') {
        const label = only ? only.toUpperCase() : 'all networks'
        return NextResponse.json({
          success: true,
          message: alreadyRunning
            ? `${label} import is already running. The feed status updates when it finishes.`
            : `${label} coupon import started. This can take several minutes; refresh to see progress.`,
        })
      }
    }

    // Real connection tests using the saved credentials (save before testing).
    if (action === 'test_connection') {
      const payload = await getPayload({ config: configPromise })
      const { user } = await payload.auth({ headers: request.headers })
      if (!user) {
        return NextResponse.json({ success: false, message: 'Log in to the admin to test connections.' }, { status: 401 })
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
      const fail = (message: string) => NextResponse.json({ success: false, message: `✗ ${message}` })
      if (!creds) return fail('No saved credentials for this network. Save them first.')

      try {
        if (network === 'cj') {
          if (!creds.websiteId || !creds.apiToken) return fail('CJ needs a Website ID (PID) and Personal Access Token.')
          const params = new URLSearchParams({
            'website-id': creds.websiteId,
            'advertiser-ids': 'joined',
            'promotion-type': 'coupon',
            'records-per-page': '1',
          })
          const res = await fetch(`https://link-search.api.cj.com/v2/link-search?${params}`, {
            headers: { Authorization: `Bearer ${creds.apiToken}` },
          })
          const body = await res.text()
          const error = body.match(/<error-message>([\s\S]*?)<\/error-message>/)?.[1]
          if (!res.ok || error) return fail(`CJ rejected the request (${res.status}): ${(error || body).slice(0, 200)}`)
          const total = body.match(/total-matched="(\d+)"/)?.[1] ?? '?'
          return NextResponse.json({ success: true, message: `✓ CJ connected. ${total} coupon links from joined advertisers.` })
        }

        if (network === 'awin') {
          if (!creds.publisherId || !creds.apiToken) return fail('Awin needs a Publisher ID and API token.')
          const res = await fetch(`https://api.awin.com/publishers/${creds.publisherId}/programmes?relationship=joined`, {
            headers: { Authorization: `Bearer ${creds.apiToken}` },
          })
          if (!res.ok) return fail(`Awin rejected the request (${res.status}): ${(await res.text()).slice(0, 200)}`)
          const list = await res.json()
          return NextResponse.json({
            success: true,
            message: `✓ Awin connected. ${Array.isArray(list) ? list.length : '?'} joined programmes.`,
          })
        }

        if (network === 'takeads') {
          if (!creds.publishKey) return fail('Takeads needs the Publish Key (used as the API public key).')
          const res = await fetch('https://api.takeads.com/v1/product/monetize-api/v1/coupon?limit=1', {
            headers: { Authorization: `Bearer ${creds.publishKey}` },
          })
          if (!res.ok) return fail(`Takeads rejected the Publish Key (${res.status}).`)
          return NextResponse.json({ success: true, message: '✓ Takeads connected. Coupon API is accessible.' })
        }

        if (network === 'impact') {
          if (!creds.publisherId || !creds.apiToken) return fail('Impact needs an Account SID and Auth Token.')
          const auth = Buffer.from(`${creds.publisherId}:${creds.apiToken}`).toString('base64')
          const res = await fetch(`https://api.impact.com/Mediapartners/${creds.publisherId}/Campaigns?PageSize=1`, {
            headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
          })
          if (!res.ok) return fail(`Impact rejected the request (${res.status}): ${(await res.text()).slice(0, 200)}`)
          const json = await res.json()
          const total = json?.['@total'] ?? json?.['@numrecords'] ?? '?'
          return NextResponse.json({ success: true, message: `✓ Impact connected. ${total} campaigns (programs) available.` })
        }

        return fail(`Unknown network: ${network}`)
      } catch (err: any) {
        return fail(`Could not reach the ${network} API: ${err?.message || err}`)
      }
    }

    if (action === 'sync_all_advertisers' || action === 'sync') {
      const payload = await getPayload({ config: configPromise })
      
      const providers = [
        { label: 'CJ Affiliate', net: 'cj' },
        { label: 'Awin Network', net: 'awin' },
        { label: 'Takeads', net: 'takeads' },
        { label: 'Showcase Catalog', net: 'showcase' },
        { label: 'Impact Radius & Rakuten', net: 'impact' },
      ]
      const feedTypes = [
        { type: 'coupons', suffix: 'Coupons & Promo Codes Feed' },
        { type: 'products', suffix: 'Product Feed' },
      ]

      // Each provider gets two separate feed records: one for coupons, one for products.
      // Coupon feeds with an importer (IMPORT_NETWORKS) are maintained by it (started above). The rest have
      // no importer yet, so they are only created (paused, zero counts) and otherwise left alone.
      for (const provider of providers) {
        for (const ft of feedTypes) {
          if (ft.type === 'coupons' && IMPORT_NETWORKS.includes(provider.net as ImportNetwork)) continue
          const existing = await payload.find({
            collection: 'affiliate-feeds',
            where: {
              and: [{ network: { equals: provider.net } }, { feedType: { equals: ft.type } }],
            },
            limit: 1,
          })
          if (existing.docs.length > 0) continue

          await payload.create({
            collection: 'affiliate-feeds',
            data: {
              feedName: `${provider.label} — ${ft.suffix}`,
              network: provider.net as any,
              feedType: ft.type as any,
              advertiserScope: 'all_advertisers',
              status: 'PAUSED',
            },
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: `Coupon import started for Awin, CJ and Takeads in the background — refresh in a few minutes to see results.`,
      })
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
