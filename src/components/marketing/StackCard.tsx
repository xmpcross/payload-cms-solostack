import React from 'react'
import Link from 'next/link'
import { ArrowRight, Layers, Wrench, Monitor } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ToolItem {
  name: string
  startingPrice?: string
}

interface HardwareItem {
  name: string
  priceRange?: string
}

interface StackCardProps {
  title: string
  slug: string
  businessModel?: string
  description?: string
  tools?: ToolItem[]
  hardware?: HardwareItem[]
}

export const StackCard: React.FC<StackCardProps> = ({
  title,
  slug,
  businessModel,
  description,
  tools = [],
  hardware = [],
}) => {
  return (
    <Card className="flex flex-col justify-between border-2 border-border/80 hover:border-amber-500/50 transition-all duration-200 hover:shadow-lg group">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge variant="secondary" className="font-semibold capitalize flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-amber-500" />
            <span>{businessModel || 'Blueprint'}</span>
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">
            {tools.length + hardware.length} Items Included
          </span>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight group-hover:text-amber-500 transition-colors">
          <Link href={`/stacks/${slug}`}>{title}</Link>
        </CardTitle>
        {description && (
          <CardDescription className="line-clamp-2 text-sm pt-1">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tools Section */}
        {tools.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Wrench className="h-3.5 w-3.5" />
              <span>Software Stack</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tools.map((tool, idx) => (
                <Badge key={idx} variant="outline" className="text-xs font-medium">
                  {tool.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Hardware Section */}
        {hardware.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Monitor className="h-3.5 w-3.5" />
              <span>Hardware Setup</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hardware.map((item, idx) => (
                <Badge key={idx} variant="outline" className="text-xs font-medium bg-muted/30">
                  {item.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <Button asChild className="w-full justify-between group-hover:bg-amber-500 group-hover:text-black font-semibold">
          <Link href={`/stacks/${slug}`}>
            <span>Explore Full Recipe</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
