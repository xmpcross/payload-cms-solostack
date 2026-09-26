import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Image from 'next/image'
import { AffiliateCTA } from '@/components/marketing/AffiliateCTA'
import { ProsConsBox } from '@/components/marketing/ProsConsBox'
import { generateSoftwareSchema } from '@/utilities/generateJsonLd'
import { ArrowLeft, Wrench, ShieldCheck, Tag, Star } from 'lucide-react'
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
      depth: 2,
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

  const featuredImage = tool.image && typeof tool.image === 'object' ? tool.image : (tool.logo && typeof tool.logo === 'object' ? tool.logo : null)
  const imageUrl = featuredImage?.url || null
  const imageAlt = featuredImage?.alt || `${tool.name} software preview`

  return (
    <article className="pt-12 pb-24 container max-w-5xl mx-auto px-4 sm:px-6">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-foreground transition-colors">
          Software Directory
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{tool.name}</span>
      </nav>

      {/* Header */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs border border-blue-500/20">
            <Wrench className="h-3.5 w-3.5" />
            <span>Software Review & Pricing</span>
          </span>
          {tool.pricingType && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20 capitalize">
              <Tag className="h-3.5 w-3.5" />
              <span>{tool.pricingType}</span>
            </span>
          )}
          {tool.rating && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs border border-amber-500/20">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{Number(tool.rating).toFixed(1)} / 5.0</span>
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
          {tool.name}
        </h1>

        {tool.tagline && (
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-normal">
            {tool.tagline}
          </p>
        )}
      </div>

      {/* Featured Image - Displayed Full Width */}
      {imageUrl && (
        <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl border border-border/80 bg-neutral-100 dark:bg-neutral-900 my-8 group">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90 drop-shadow-md">
            <span className="font-semibold tracking-wide uppercase bg-black/50 backdrop-blur-xs px-3 py-1 rounded-md">
              {tool.name}
            </span>
            <span className="bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-md hidden sm:inline-block">
              Tested by SoloStack Lab
            </span>
          </div>
        </div>
      )}

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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Our Software Verdict
          </h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
            {tool.summary}
          </div>
        </section>
      )}

      {/* Editorial Transparency Footer */}
      <div className="mt-12 pt-6 border-t border-border flex items-center gap-3 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
        <p>
          SoloStack independently evaluates software for solopreneurs and creators. When you buy through links on our site, we may earn an affiliate commission at no extra cost to you.
        </p>
      </div>
    </article>
  )
}
