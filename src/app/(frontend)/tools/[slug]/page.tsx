import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { AffiliateCTA } from '@/components/marketing/AffiliateCTA'
import { ProsConsBox } from '@/components/marketing/ProsConsBox'
import { generateSoftwareSchema } from '@/utilities/generateJsonLd'
import { ArrowLeft, Wrench } from 'lucide-react'
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
      collection: 'tools',
      limit: 1000,
      select: { slug: true },
    })
    return result.docs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.warn('Database error in generateStaticParams /tools/[slug]:', error)
    return []
  }
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const tool = await getToolBySlug(slug)
  if (!tool) return { title: 'Tool Not Found | SoloStack' }

  return {
    title: `${tool.name} Review & Pricing Guide | SoloStack`,
    description: tool.tagline || `In-depth review and features for ${tool.name}`,
  }
}

async function getToolBySlug(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'tools',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    return result.docs[0] || null
  } catch (error) {
    console.warn('Database error in getToolBySlug:', error)
    return null
  }
}

export default async function ToolDetailPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const tool: any = await getToolBySlug(slug)

  if (!tool) return notFound()

  const jsonLd = generateSoftwareSchema({
    name: tool.name,
    tagline: tool.tagline,
    pricingType: tool.pricingType,
    startingPrice: tool.startingPrice,
    rating: tool.rating,
    affiliateUrl: tool.affiliateUrl,
  })

  const pros = tool.pros?.map((p: any) => (typeof p === 'string' ? p : p.pro || '')).filter(Boolean)
  const cons = tool.cons?.map((c: any) => (typeof c === 'string' ? c : c.con || '')).filter(Boolean)

  return (
    <article className="pt-16 pb-24 container max-w-4xl mx-auto px-4">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Button asChild variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
        <Link href="/tools">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Software Directory</span>
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-4 border-b pb-8 mb-10">
        <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm">
          <Wrench className="h-4 w-4" />
          <span>Software Review & Pricing</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{tool.name}</h1>
        {tool.tagline && <p className="text-xl text-muted-foreground leading-relaxed">{tool.tagline}</p>}
      </div>

      {/* Main Affiliate CTA Card */}
      <AffiliateCTA
        name={tool.name}
        tagline={tool.tagline}
        pricingType={tool.pricingType}
        startingPrice={tool.startingPrice}
        rating={tool.rating}
        affiliateUrl={tool.affiliateUrl || '#'}
        isFeatured
      />

      {/* Pros & Cons */}
      {(pros?.length || cons?.length) && <ProsConsBox pros={pros} cons={cons} title={`Why Choose ${tool.name}?`} />}

      {/* Summary Section */}
      {tool.summary && (
        <section className="my-10 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Our Verdict</h2>
          <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">{tool.summary}</p>
        </section>
      )}
    </article>
  )
}
