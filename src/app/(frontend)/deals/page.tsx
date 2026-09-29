import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { DealsClient, DealItem } from '@/components/marketing/DealsClient'
import { Tag, ShieldCheck, Flame, Percent, CheckCircle2 } from 'lucide-react'
import { FAQSection } from '@/components/FAQSection'

// Most deals loaded onto the page (the highest-clicked first). Raise or lower as needed.
const MAX_DEALS = 300

export const revalidate = 300 // Revalidate cache every 5 minutes

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Verified Deals, Promo Codes & Software Discounts | SoloStack',
    description:
      'Curated discounts, active promo codes, and software deals for solo founders and operators. Verified from CJ Affiliate & Awin Network.',
    openGraph: {
      title: 'Verified Deals & Promo Codes | SoloStack',
      description:
        'Curated discounts, active promo codes, and software deals for solo founders and operators.',
      type: 'website',
      url: 'https://solostack.au/deals',
    },
    alternates: {
      canonical: 'https://solostack.au/deals',
    },
  }
}

export default async function DealsPage() {
  let deals: DealItem[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'affiliate-coupons',
      where: {
        and: [
          { isActive: { not_equals: false } },
          { or: [{ expiryDate: { exists: false } }, { expiryDate: { greater_than: new Date().toISOString() } }] },
        ],
      },
      sort: '-clicks',
      limit: MAX_DEALS,
    })

    deals = (result.docs || []).map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      storeName: doc.storeName,
      network: doc.network,
      category:
        (typeof doc.siteCategory === 'object' && doc.siteCategory?.title) || doc.category || 'Software & Web Hosting',
      code: doc.code || undefined,
      discountText: doc.discountText || undefined,
      destinationUrl: doc.destinationUrl,
      affiliateUrl: doc.affiliateUrl,
      expiryDate: doc.expiryDate || undefined,
      terms: doc.terms || undefined,
      clicks: doc.clicks || 0,
    }))
  } catch (error) {
    console.warn('Database error loading affiliate-coupons:', error)
  }

  // Generate ItemList Schema for SEO rich snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: deals.map((deal, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: deal.title,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          seller: {
            '@type': 'Organization',
            name: deal.storeName,
          },
        },
      },
    })),
  }

  const dealsFaqs = [
    {
      question: 'Are deal-hunting communities safe to use?',
      answer:
        'Yes, reputable deal-hunting communities and curated voucher hubs are safe. Community members and editors regularly test coupon codes, verify affiliate tracking links, and filter out unauthorized sellers. Always ensure checkout is completed on the verified merchant platform and never share sensitive financial information on public forums.',
    },
    {
      question: 'How can I tell if a deal is genuinely a good price?',
      answer:
        "Compare prices across multiple certified retailers, inspect historical pricing averages, and factor in future subscription renewals. A genuine discount represents verifiable savings against the tool's standard 90-day market price, not an inflated reference MSRP.",
    },
    {
      question: 'Are deal communities free to join?',
      answer:
        'Yes, top deal communities and directories are 100% free for members. They are sustained through commercial affiliate partnerships with software and hardware brands, who pay a referral commission when you purchase through verified partner links at zero extra cost to you.',
    },
    {
      question: 'What is the difference between a coupon site and a deal community?',
      answer:
        'A generic coupon site relies on automated aggregators that frequently display expired or non-working promotional codes. A curated deal community features active editorial vetting, user feedback on product reliability, and real-time alerts on exclusive partner vouchers and temporary price errors.',
    },
  ]

  return (
    <div className="pt-12 pb-24 min-h-screen bg-slate-50/50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        {/* CouponPilot Style Header */}
        <div className="space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold border border-blue-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Verified Coupon Codes & Deals • Tested Daily</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Working Coupon Codes, Deals & Discounts
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
            Find verified coupon codes, exclusive discounts, and active partner promotions. Every voucher code and tracking link is hand-tested before listing.
          </p>

          {/* Quick Metrics Bar (CouponPilot style) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">100% Tested Daily</div>
                <div className="text-xs text-slate-500 dark:text-neutral-400">Verified by real editors</div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Percent className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Up to 78% Instant Savings</div>
                <div className="text-xs text-slate-500 dark:text-neutral-400">Applied at checkout</div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Direct Partner Links</div>
                <div className="text-xs text-slate-500 dark:text-neutral-400">CJ & Awin network vouchers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Affiliate Disclosure Notice */}
        <div className="bg-white dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 rounded-lg p-4 text-xs text-slate-600 dark:text-neutral-400 flex items-start gap-3 shadow-2xs">
          <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Affiliate Transparency:</strong> SoloStack is reader-supported. When you purchase through links or redeem coupon codes featured on this page, we may earn an affiliate commission from our merchant partners at zero extra cost to you.
          </p>
        </div>

        {/* Main Interactive Deals Catalog (CouponPilot stream layout) */}
        <DealsClient initialDeals={deals} />

        {/* How We Test Vouchers Box */}
        <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 p-6 sm:p-8 space-y-4 shadow-2xs">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            How We Test & Verify Coupon Codes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs flex items-center justify-center font-mono">1</span>
                Direct Partner Feeds
              </h3>
              <p>We source active discount codes directly from brand affiliate managers across CJ Affiliate and Awin, avoiding scraper spam.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs flex items-center justify-center font-mono">2</span>
                Manual Checkout Testing
              </h3>
              <p>Our team manually tests vouchers in real checkout carts to confirm minimum purchase thresholds, exclusions, and expiration dates.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs flex items-center justify-center font-mono">3</span>
                Zero Spam Guarantee
              </h3>
              <p>Expired or non-working promotional codes are automatically flagged and retired to ensure high redemption success rates.</p>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions (FAQ) Accordion matching reference image */}
        <div className="pt-6 border-t border-slate-200 dark:border-neutral-800">
          <FAQSection items={dealsFaqs} />
        </div>
      </div>
    </div>
  )
}
