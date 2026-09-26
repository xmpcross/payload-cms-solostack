import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { AffiliateCTA } from '@/components/marketing/AffiliateCTA'
import { Monitor } from 'lucide-react'

export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Desk & Studio Hardware Directory | SoloStack',
    description:
      'High-performance ergonomic chairs, ultrawide monitors, studio microphones, and remote office gear.',
  }
}

export default async function HardwareDirectoryPage() {
  let hardware: any[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'hardware',
      depth: 1,
      limit: 100,
    })
    hardware = result.docs
  } catch (error) {
    console.warn('Database connection error in /hardware:', error)
  }

  return (
    <div className="pt-20 pb-24 container max-w-5xl mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-sm font-semibold border border-amber-500/20">
          <Monitor className="h-4 w-4" />
          <span>Studio & Desk Gear</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Desk & Studio Hardware Directory
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          High-performance workstation gear engineered for 10-hour productivity and studio-grade content.
        </p>
      </div>

      {hardware.length > 0 ? (
        <div className="space-y-6">
          {hardware.map((item) => (
            <AffiliateCTA
              key={item.id}
              name={item.name}
              tagline={`${item.manufacturer ? `${item.manufacturer} — ` : ''}${item.specs || ''}`}
              startingPrice={item.priceRange}
              affiliateUrl={item.retailUrl || '#'}
              ctaText="Check Retail Pricing"
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border border-dashed rounded-xl bg-muted/20">
          <p className="text-muted-foreground">No hardware equipment listed yet.</p>
        </div>
      )}
    </div>
  )
}
