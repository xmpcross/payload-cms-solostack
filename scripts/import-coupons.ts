/**
 * Scheduled coupon import + expiry sweep.
 *   NODE_ENV=production npx tsx scripts/import-coupons.ts          # import Awin & CJ, then sweep
 *   NODE_ENV=production npx tsx scripts/import-coupons.ts --sweep  # only deactivate/purge expired
 * NODE_ENV=production stops Payload from running a dev schema push.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { importAllCoupons, sweepExpiredCoupons } from '../src/utilities/couponImporter'

async function main() {
  const payload = await getPayload({ config: configPromise })
  const result = process.argv.includes('--sweep')
    ? await sweepExpiredCoupons(payload)
    : await importAllCoupons(payload)
  console.log(JSON.stringify(result, null, 2))
  process.exit(0)
}

main().catch((err) => {
  console.error('Coupon import failed:', err)
  process.exit(1)
})
