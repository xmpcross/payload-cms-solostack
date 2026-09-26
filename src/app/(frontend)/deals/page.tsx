import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { DealsClient, DealItem } from '@/components/marketing/DealsClient'
import { Tag, ShieldCheck, Flame, Percent, CheckCircle2 } from 'lucide-react'

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
        isActive: {
          equals: true,
        },
      },
      sort: '-clicks',
      limit: 100,
    })

    deals = (result.docs || []).map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      storeName: doc.storeName,
      network: doc.network,
      category: doc.category || 'Software & Web Hosting',
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

  return (
    <div className="pt-24 pb-28 min-h-screen bg-background text-foreground">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container max-w-6xl mx-auto px-4 md:px-6 space-y-12">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-semibold border border-primary/20 shadow-xs">
            <Flame className="h-4 w-4 text-primary animate-pulse" />
            <span>Curated Partner Deals & Vouchers</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Verified Deals & Promo Codes
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Save on top solo business software, hosting, developer tools, and productivity services.
            All voucher codes and tracking links are tested daily.
          </p>

          {/* Quick Value Metrics */}
          <div className="pt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="bg-card/60 border border-border/80 rounded-xl p-3 text-center">
              <div className="text-xl font-black text-primary">100%</div>
              <div className="text-xs text-muted-foreground font-medium">Tested Codes</div>
            </div>
            <div className="bg-card/60 border border-border/80 rounded-xl p-3 text-center">
              <div className="text-xl font-black text-emerald-500">Up to 75%</div>
              <div className="text-xs text-muted-foreground font-medium">Instant Savings</div>
            </div>
            <div className="bg-card/60 border border-border/80 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
              <div className="text-xl font-black text-foreground">CJ & Awin</div>
              <div className="text-xs text-muted-foreground font-medium">Direct Partner Links</div>
            </div>
          </div>
        </div>

        {/* Affiliate Disclosure Notice */}
        <div className="bg-muted/40 border border-border/60 rounded-xl p-4 text-xs text-muted-foreground flex items-start gap-3">
          <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            <strong>Affiliate Transparency:</strong> SoloStack is reader-supported. When you purchase through links or redeem coupon codes featured on this page, we may earn an affiliate commission at zero additional cost to you. We only recommend software and services that meet our strict quality criteria.
          </p>
        </div>

        {/* Main Interactive Deals Catalog */}
        <DealsClient initialDeals={deals} />
      </div>
    </div>
  )
}
