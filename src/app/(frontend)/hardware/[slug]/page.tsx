import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Image from 'next/image'
import { AffiliateCTA } from '@/components/marketing/AffiliateCTA'
import { generateProductSchema } from '@/utilities/generateJsonLd'
import { ArrowLeft, Monitor, CheckCircle2, ShieldCheck, Tag, Sparkles } from 'lucide-react'
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
      depth: 2,
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

  const specList = Array.isArray(item.specs)
    ? item.specs.map((s: any) => (typeof s === 'string' ? s : s.spec || '')).filter(Boolean)
    : typeof item.specs === 'string'
    ? [item.specs]
    : []

  const specText = specList.join(' • ')

  const jsonLd = generateProductSchema({
    name: item.name,
    manufacturer: item.manufacturer,
    specs: specText,
    priceRange: item.priceRange,
    retailUrl: item.retailUrl,
  })

  const featuredImage = item.image && typeof item.image === 'object' ? item.image : null
  const imageUrl = featuredImage?.url || null
  const imageAlt = featuredImage?.alt || `${item.name} featured product photo`

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
        <Link href="/hardware" className="hover:text-foreground transition-colors">
          Hardware
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{item.name}</span>
      </nav>

      {/* Product Header */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs border border-amber-500/20">
            <Monitor className="h-3.5 w-3.5" />
            <span>Desk & Studio Hardware</span>
          </span>
          {item.priceRange && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">
              <Tag className="h-3.5 w-3.5" />
              <span>Guide: {item.priceRange}</span>
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
          {item.name}
        </h1>

        {item.manufacturer && (
          <p className="text-base sm:text-lg text-muted-foreground font-medium">
            Manufacturer & Brand: <span className="text-foreground font-semibold">{item.manufacturer}</span>
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
              {item.name}
            </span>
            <span className="bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-md hidden sm:inline-block">
              Tested by SoloStack Lab
            </span>
          </div>
        </div>
      )}

      {/* Main Affiliate CTA Card */}
      <AffiliateCTA
        name={item.name}
        tagline={specText}
        startingPrice={item.priceRange}
        affiliateUrl={item.retailUrl || '#'}
        ctaText="Check Current Retail Price"
        isFeatured
      />

      {/* Key Specifications Grid */}
      {specList.length > 0 && (
        <div className="my-10 rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Key Specifications & Benchmark Notes
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {specList.map((spec: string, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-border/60"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{spec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verdict Section */}
      {item.verdict && (
        <section className="my-10 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Our Hardware Verdict
          </h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
            {item.verdict}
          </div>
        </section>
      )}

      {/* Editorial Transparency Footer */}
      <div className="mt-12 pt-6 border-t border-border flex items-center gap-3 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
        <p>
          SoloStack independently evaluates hardware for solopreneurs and creators. When you buy through links on our site, we may earn an affiliate commission at no extra cost to you.
        </p>
      </div>
    </article>
  )
}
