import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function seedTakeadsNetwork() {
  console.log('Seeding Takeads Affiliate Network record...')
  const payload = await getPayload({ config: configPromise })

  const existing = await payload.find({
    collection: 'affiliate-networks',
    where: {
      name: { equals: 'Takeads Affiliate Network (Mitgo)' },
    },
  })

  const dataObj = {
    name: 'Takeads Affiliate Network (Mitgo)',
    networkType: 'takeads',
    status: 'active',
    linkStrategy: 'append_subid',
    publisherId: 'tk_pub_98471',
    platformId: 'tk_plt_98471',
    publishKey: 'pub_key_8841920',
    accountApiKey: process.env.TAKEADS_ACCOUNT_API_KEY || '',
    apiToken: process.env.TAKEADS_API_TOKEN || '',
    lastSyncAt: new Date().toISOString(),
  }

  if (existing.docs.length === 0) {
    const created = await payload.create({
      collection: 'affiliate-networks',
      data: dataObj as any,
    })
    console.log('Successfully created Takeads Network record:', created.id)
  } else {
    await payload.update({
      collection: 'affiliate-networks',
      id: existing.docs[0].id,
      data: dataObj as any,
    })
    console.log('Successfully updated Takeads Network record:', existing.docs[0].id)
  }

  // Also seed Takeads feed record in affiliate-feeds
  const existingFeed = await payload.find({
    collection: 'affiliate-feeds',
    where: {
      feedName: { equals: 'Takeads Native Content Feed (All Advertisers)' },
    },
  })

  if (existingFeed.docs.length === 0) {
    const createdFeed = await payload.create({
      collection: 'affiliate-feeds',
      data: {
        feedName: 'Takeads Native Content Feed (All Advertisers)',
        network: 'takeads',
        feedType: 'coupons',
        advertiserScope: 'all_advertisers',
        status: 'ACTIVE',
        lastSync: new Date().toISOString(),
        addedCount: 420,
        updatedCount: 18,
      },
    })
    console.log('Successfully created Takeads Feed record:', createdFeed.id)
  } else {
    console.log('Takeads Feed record already exists:', existingFeed.docs[0].id)
  }

  process.exit(0)
}

seedTakeadsNetwork().catch((err) => {
  console.error('Error seeding Takeads:', err)
  process.exit(1)
})
