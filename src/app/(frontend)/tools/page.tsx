import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { AffiliateCTA } from '@/components/marketing/AffiliateCTA'
import { Wrench } from 'lucide-react'

export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Software & SaaS Tool Directory for Solo Operators | SoloStack',
    description:
      'Explore top-rated B2B software, automation tools, and productivity SaaS for 1-person businesses.',
  }
}

export default async function ToolsDirectoryPage() {
  let tools: any[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'tools',
      depth: 1,
      limit: 100,
    })
    tools = result.docs
  } catch (error) {
    console.warn('Database connection error in /tools:', error)
  }

  return (
    <div className="pt-20 pb-24 container max-w-5xl mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-sm font-semibold border border-amber-500/20">
          <Wrench className="h-4 w-4" />
          <span>Curated SaaS</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          B2B Software & Tool Directory
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Tested productivity tools, CRM systems, automation engines, and content creation platforms.
        </p>
      </div>

      {tools.length > 0 ? (
        <div className="space-y-6">
          {tools.map((tool) => (
            <AffiliateCTA
              key={tool.id}
              name={tool.name}
              tagline={tool.tagline}
              pricingType={tool.pricingType}
              startingPrice={tool.startingPrice}
              rating={tool.rating}
              affiliateUrl={tool.affiliateUrl || '#'}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border border-dashed rounded-xl bg-muted/20">
          <p className="text-muted-foreground">No tools listed yet.</p>
        </div>
      )}
    </div>
  )
}
