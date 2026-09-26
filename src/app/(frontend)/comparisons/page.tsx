import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Swords, Award, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Head-to-Head Software & Hardware Battles | SoloStack Comparisons',
    description:
      'Direct comparisons between top B2B tools and hardware equipment to help you decide what to buy.',
  }
}

export default async function ComparisonsDirectoryPage() {
  let comparisons: any[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'comparisons',
      depth: 2,
      limit: 100,
    })
    comparisons = result.docs
  } catch (error) {
    console.warn('Database connection error in /comparisons:', error)
  }

  return (
    <div className="pt-20 pb-24 container max-w-5xl mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-sm font-semibold border border-amber-500/20">
          <Swords className="h-4 w-4" />
          <span>Head-to-Head Showdowns</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Software & Hardware Comparisons
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Side-by-side spec battles and feature breakdowns for decision-stage buyers.
        </p>
      </div>

      {comparisons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparisons.map((comp) => (
            <Card key={comp.id} className="border-2 flex flex-col justify-between hover:border-amber-500/50 transition-all">
              <CardHeader>
                {comp.winnerBadge && (
                  <Badge variant="accent" className="w-fit mb-2 flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5" />
                    <span>Winner: {comp.winnerBadge}</span>
                  </Badge>
                )}
                <CardTitle className="text-2xl font-bold tracking-tight">
                  <Link href={`/comparisons/${comp.slug}`}>{comp.title}</Link>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-around p-4 rounded-lg bg-muted/40 text-center">
                  <div className="font-bold text-lg">{comp.toolA?.name || 'Tool A'}</div>
                  <Swords className="h-5 w-5 text-amber-500" />
                  <div className="font-bold text-lg">{comp.toolB?.name || 'Tool B'}</div>
                </div>
              </CardContent>

              <CardFooter>
                <Button asChild className="w-full justify-between font-semibold">
                  <Link href={`/comparisons/${comp.slug}`}>
                    <span>View Feature Matrix & Verdict</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border border-dashed rounded-xl bg-muted/20">
          <p className="text-muted-foreground">No comparison battles listed yet.</p>
        </div>
      )}
    </div>
  )
}
