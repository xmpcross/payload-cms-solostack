import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function seedAllFeeds() {
  console.log('Seeding All Advertiser Feeds under Affiliate Suite...')
  const payload = await getPayload({ config: configPromise })

  // Each provider gets a separate Coupons feed and Product Feed.
  const providers = [
    { label: 'CJ Affiliate', network: 'cj', coupons: 2400, products: 1400 },
    { label: 'Awin Network', network: 'awin', coupons: 2600, products: 1600 },
    { label: 'Takeads', network: 'takeads', coupons: 420, products: 180 },
    { label: 'Showcase Catalog', network: 'showcase', coupons: 1400, products: 800 },
    { label: 'Impact Radius & Rakuten', network: 'impact', coupons: 900, products: 600 },
  ]

  const feedsToSeed = providers.flatMap((p) => [
    {
      feedName: `${p.label} — Coupons & Promo Codes Feed`,
      network: p.network,
      advertiserScope: 'all_advertisers',
      feedType: 'coupons',
      status: 'ACTIVE',
      lastSync: new Date().toISOString(),
      addedCount: p.coupons,
      updatedCount: 0,
      skippedCount: 0,
      failedCount: 0,
    },
    {
      feedName: `${p.label} — Product Feed`,
      network: p.network,
      advertiserScope: 'all_advertisers',
      feedType: 'products',
      status: 'ACTIVE',
      lastSync: new Date().toISOString(),
      addedCount: p.products,
      updatedCount: 0,
      skippedCount: 0,
      failedCount: 0,
    },
  ])

  for (const feed of feedsToSeed) {
    const existing = await payload.find({
      collection: 'affiliate-feeds',
      where: {
        and: [{ network: { equals: feed.network } }, { feedType: { equals: feed.feedType } }],
      },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'affiliate-feeds',
        data: feed as any,
      })
      console.log(`Created feed: ${feed.feedName}`)
    } else {
      await payload.update({
        collection: 'affiliate-feeds',
        id: existing.docs[0].id,
        data: {
          status: 'ACTIVE',
          advertiserScope: 'all_advertisers',
          lastSync: new Date().toISOString(),
          updatedCount: (existing.docs[0].updatedCount || 0) + 10,
        } as any,
      })
      console.log(`Updated feed: ${feed.feedName}`)
    }
  }

  console.log('All Advertiser Feeds successfully seeded!')
  process.exit(0)
}

seedAllFeeds().catch((err) => {
  console.error('Error seeding feeds:', err)
  process.exit(1)
})
