import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { AffiliateCTA } from '@/components/marketing/AffiliateCTA'
import { ProsConsBox } from '@/components/marketing/ProsConsBox'
import { Layers, Wrench, Monitor, ArrowLeft } from 'lucide-react'
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
      collection: 'stacks',
      limit: 1000,
      select: { slug: true },
    })
    return result.docs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.warn('Database error in generateStaticParams /stacks/[slug]:', error)
    return []
  }
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const stack = await getStackBySlug(slug)
  if (!stack) return { title: 'Stack Not Found | SoloStack' }

  return {
    title: `${stack.title} | SoloStack Blueprint`,
    description: stack.description || `Complete tech stack blueprint for ${stack.title}`,
  }
}

async function getStackBySlug(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'stacks',
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
    })
    return result.docs[0] || null
  } catch (error) {
    console.warn('Database error in getStackBySlug:', error)
    return null
  }
}

export default async function StackDetailPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const stack: any = await getStackBySlug(slug)

  if (!stack) return notFound()

  const { title, businessModel, description, tools = [], hardware = [] } = stack

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description: description || `Solopreneur tech stack blueprint for ${title}`,
    itemListElement: [
      ...tools.map((t: any, idx: number) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: t.name,
      })),
      ...hardware.map((h: any, idx: number) => ({
        '@type': 'ListItem',
        position: tools.length + idx + 1,
        name: h.name,
      })),
    ],
  }

  return (
    <article className="pt-16 pb-24 container max-w-4xl mx-auto px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Button asChild variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
        <Link href="/stacks">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Stack Directory</span>
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-4 border-b pb-8 mb-10">
        <div className="flex items-center gap-3">
          <Badge variant="accent" className="text-sm font-semibold capitalize flex items-center gap-1.5">
            <Layers className="h-4 w-4" />
            <span>{businessModel || 'Blueprint'}</span>
          </Badge>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{title}</h1>

        {description && (
          <p className="text-xl text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>

      {/* Included Tools */}
      {tools.length > 0 && (
        <section className="my-12 space-y-8">
          <div className="flex items-center gap-2 border-b pb-3">
            <Wrench className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-bold tracking-tight">Software Stack Items</h2>
          </div>

          <div className="space-y-6">
            {tools.map((tool: any, idx: number) => (
              <div key={idx} className="border rounded-xl p-6 bg-card space-y-4">
                <AffiliateCTA
                  name={tool.name}
                  tagline={tool.tagline}
                  pricingType={tool.pricingType}
                  startingPrice={tool.startingPrice}
                  rating={tool.rating}
                  affiliateUrl={tool.affiliateUrl || '#'}
                />

                {(tool.pros?.length || tool.cons?.length) && (
                  <ProsConsBox
                    pros={tool.pros?.map((p: any) => (typeof p === 'string' ? p : p.pro || ''))}
                    cons={tool.cons?.map((c: any) => (typeof c === 'string' ? c : c.con || ''))}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Included Hardware */}
      {hardware.length > 0 && (
        <section className="my-12 space-y-8">
          <div className="flex items-center gap-2 border-b pb-3">
            <Monitor className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-bold tracking-tight">Hardware Setup Items</h2>
          </div>

          <div className="space-y-6">
            {hardware.map((item: any, idx: number) => {
              const specText = Array.isArray(item.specs)
                ? item.specs.map((s: any) => (typeof s === 'string' ? s : s.spec || '')).filter(Boolean).join(' • ')
                : typeof item.specs === 'string'
                ? item.specs
                : ''

              return (
                <div key={idx} className="border rounded-xl p-6 bg-card space-y-4">
                  <AffiliateCTA
                    name={item.name}
                    tagline={specText}
                    startingPrice={item.priceRange}
                    affiliateUrl={item.retailUrl || '#'}
                    ctaText="View Retail Price"
                  />
                </div>
              )
            })}
          </div>
        </section>
      )}
    </article>
  )
}
