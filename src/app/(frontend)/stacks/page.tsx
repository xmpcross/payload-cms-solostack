import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { StackCard } from '@/components/marketing/StackCard'
import { Layers } from 'lucide-react'

export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Solopreneur Stack Directory & Operational Blueprints | SoloStack',
    description:
      'Curated software and hardware toolchains for 1-person businesses, creators, and remote agency operators.',
  }
}

export default async function StacksPage() {
  let stacks: any[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'stacks',
      depth: 2,
      limit: 100,
    })
    stacks = result.docs
  } catch (error) {
    console.warn('Database connection error in /stacks:', error)
  }

  return (
    <div className="pt-20 pb-24 container max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-sm font-semibold border border-amber-500/20">
          <Layers className="h-4 w-4" />
          <span>Tested Workflows</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Solopreneur Stack Directory
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Battle-tested software recipes and hardware configurations powering high-revenue 1-person businesses.
        </p>
      </div>

      {/* Grid */}
      {stacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stacks.map((stack) => (
            <StackCard
              key={stack.id}
              title={stack.title}
              slug={stack.slug}
              businessModel={stack.businessModel}
              description={stack.description}
              tools={stack.tools?.map((t: any) => ({ name: t.name, startingPrice: t.startingPrice }))}
              hardware={stack.hardware?.map((h: any) => ({ name: h.name, priceRange: h.priceRange }))}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border border-dashed rounded-xl bg-muted/20">
          <p className="text-muted-foreground">No stack blueprints found yet.</p>
        </div>
      )}
    </div>
  )
}
