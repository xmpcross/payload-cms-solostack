import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { ComparisonTable } from '@/components/marketing/ComparisonTable'
import { AffiliateCTA } from '@/components/marketing/AffiliateCTA'
import { Swords, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const revalidate = 600

type Args = {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'comparisons',
      limit: 1000,
      select: { slug: true },
    })
    return result.docs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.warn('Database error in generateStaticParams /comparisons/[slug]:', error)
    return []
  }
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const comparison = await getComparisonBySlug(slug)
  if (!comparison) return { title: 'Comparison Not Found | SoloStack' }

  return {
    title: `${comparison.title} | SoloStack Showdown`,
    description: `Detailed comparison and verdict for ${comparison.title}`,
  }
}

async function getComparisonBySlug(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'comparisons',
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
    })
    return result.docs[0] || null
  } catch (error) {
    console.warn('Database error in getComparisonBySlug:', error)
    return null
  }
}

export default async function ComparisonDetailPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const comparison: any = await getComparisonBySlug(slug)

  if (!comparison) return notFound()

  const { title, toolA, toolB, winnerBadge, featureMatrix = [] } = comparison

  const rows = featureMatrix.map((item: any) => ({
    feature: item.feature,
    toolAValue: item.toolAValue,
    toolBValue: item.toolBValue,
  }))

  return (
    <article className="pt-16 pb-24 container max-w-4xl mx-auto px-4">
      <Button asChild variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
        <Link href="/comparisons">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Showdowns</span>
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-4 border-b pb-8 mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-sm font-semibold border border-amber-500/20">
          <Swords className="h-4 w-4" />
          <span>Head-to-Head Battle</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{title}</h1>
      </div>

      {/* Feature Comparison Table */}
      {rows.length > 0 && (
        <section className="my-10 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Side-by-Side Spec Matrix</h2>
          <ComparisonTable
            toolAName={toolA?.name || 'Tool A'}
            toolBName={toolB?.name || 'Tool B'}
            toolAAffiliateUrl={toolA?.affiliateUrl}
            toolBAffiliateUrl={toolB?.affiliateUrl}
            rows={rows}
            winnerBadge={winnerBadge}
          />
        </section>
      )}

      {/* Individual Tool Overviews */}
      <div className="my-12 space-y-8">
        <h2 className="text-2xl font-bold tracking-tight">Detailed Breakdown</h2>

        {toolA && (
          <AffiliateCTA
            name={toolA.name}
            tagline={toolA.tagline}
            pricingType={toolA.pricingType}
            startingPrice={toolA.startingPrice}
            rating={toolA.rating}
            affiliateUrl={toolA.affiliateUrl || '#'}
            ctaText={`Get Started with ${toolA.name}`}
          />
        )}

        {toolB && (
          <AffiliateCTA
            name={toolB.name}
            tagline={toolB.tagline}
            pricingType={toolB.pricingType}
            startingPrice={toolB.startingPrice}
            rating={toolB.rating}
            affiliateUrl={toolB.affiliateUrl || '#'}
            ctaText={`Get Started with ${toolB.name}`}
          />
        )}
      </div>
    </article>
  )
}
