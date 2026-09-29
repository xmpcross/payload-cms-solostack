/**
 * Scheduled coupon import + expiry sweep.
 *   NODE_ENV=production npx tsx scripts/import-coupons.ts                # import all networks, then sweep
 *   NODE_ENV=production npx tsx scripts/import-coupons.ts --network=cj   # one network (awin | cj | takeads)
 *   NODE_ENV=production npx tsx scripts/import-coupons.ts --sweep        # only deactivate/purge expired
 * NODE_ENV=production stops Payload from running a dev schema push.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { IMPORT_NETWORKS, importAllCoupons, sweepExpiredCoupons } from '../src/utilities/couponImporter'

async function main() {
  const arg = process.argv.find((a) => a.startsWith('--network='))?.split('=')[1]
  const network = IMPORT_NETWORKS.find((n) => n === arg)
  if (arg && !network) throw new Error(`Unknown network "${arg}". Use one of: ${IMPORT_NETWORKS.join(', ')}`)

  const payload = await getPayload({ config: configPromise })
  const result = process.argv.includes('--sweep')
    ? await sweepExpiredCoupons(payload)
    : await importAllCoupons(payload, network ? [network] : IMPORT_NETWORKS)
  console.log(JSON.stringify(result, null, 2))
  process.exit(0)
}

main().catch((err) => {
  console.error('Coupon import failed:', err)
  process.exit(1)
})
