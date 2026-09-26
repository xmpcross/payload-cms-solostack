import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { AffiliateCTA } from '@/components/marketing/AffiliateCTA'
import { generateProductSchema } from '@/utilities/generateJsonLd'
import { ArrowLeft, Monitor } from 'lucide-react'
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
      collection: 'hardware',
      limit: 1000,
      select: { slug: true },
    })
    return result.docs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.warn('Database error in generateStaticParams /hardware/[slug]:', error)
    return []
  }
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const item = await getHardwareBySlug(slug)
  if (!item) return { title: 'Hardware Not Found | SoloStack' }

  return {
    title: `${item.name} Specification & Review | SoloStack`,
    description: item.specs ? `Specs: ${item.specs}` : `In-depth hardware review for ${item.name}`,
  }
}

async function getHardwareBySlug(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'hardware',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    return result.docs[0] || null
  } catch (error) {
    console.warn('Database error in getHardwareBySlug:', error)
    return null
  }
}

export default async function HardwareDetailPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const item: any = await getHardwareBySlug(slug)

  if (!item) return notFound()

  const specText = Array.isArray(item.specs)
    ? item.specs.map((s: any) => (typeof s === 'string' ? s : s.spec || '')).filter(Boolean).join(' • ')
    : typeof item.specs === 'string'
    ? item.specs
    : ''

  const jsonLd = generateProductSchema({
    name: item.name,
    manufacturer: item.manufacturer,
    specs: specText,
    priceRange: item.priceRange,
    retailUrl: item.retailUrl,
  })

  return (
    <article className="pt-16 pb-24 container max-w-4xl mx-auto px-4">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Button asChild variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
        <Link href="/hardware">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Hardware Directory</span>
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-4 border-b pb-8 mb-10">
        <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm">
          <Monitor className="h-4 w-4" />
          <span>Desk & Studio Hardware</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{item.name}</h1>
        {item.manufacturer && (
          <p className="text-lg text-muted-foreground font-semibold">Manufacturer: {item.manufacturer}</p>
        )}
      </div>

      {/* Main Affiliate CTA Card */}
      <AffiliateCTA
        name={item.name}
        tagline={specText}
        startingPrice={item.priceRange}
        affiliateUrl={item.retailUrl || '#'}
        ctaText="Check Current Retail Price"
        isFeatured
      />

      {/* Verdict Section */}
      {item.verdict && (
        <section className="my-10 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Our Hardware Verdict</h2>
          <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">{item.verdict}</p>
        </section>
      )}
    </article>
  )
}
