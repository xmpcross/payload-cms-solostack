import React from 'react'
import { ExternalLink, Star, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface AffiliateCTAProps {
  name: string
  tagline?: string
  pricingType?: string
  startingPrice?: string
  rating?: number
  affiliateUrl: string
  ctaText?: string
  isFeatured?: boolean
}

export const AffiliateCTA: React.FC<AffiliateCTAProps> = ({
  name,
  tagline,
  pricingType,
  startingPrice,
  rating,
  affiliateUrl,
  ctaText = 'Visit Official Site',
  isFeatured = false,
}) => {
  return (
    <Card
      className={`my-8 border-2 overflow-hidden transition-all shadow-md ${
        isFeatured
          ? 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20'
          : 'border-border bg-card'
      }`}
    >
      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-2xl font-bold tracking-tight">{name}</h3>
            {pricingType && (
              <Badge variant="secondary" className="capitalize">
                {pricingType}
              </Badge>
            )}
            {startingPrice && (
              <Badge variant="accent">From {startingPrice}</Badge>
            )}
          </div>

          {tagline && (
            <p className="text-muted-foreground text-base leading-relaxed">{tagline}</p>
          )}

          {rating && (
            <div className="flex items-center gap-1.5 pt-1">
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(rating)
                        ? 'fill-current text-amber-500'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{rating.toFixed(1)} / 5.0</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Tested & Verified Link. Partner Disclosure Applies.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-3 shrink-0">
          <Button
            asChild
            size="lg"
            className="font-semibold gap-2 shadow-lg bg-amber-500 hover:bg-amber-600 text-black dark:text-black"
          >
            <a href={affiliateUrl} target="_blank" rel="noopener noreferrer">
              <span>{ctaText}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
