import React from 'react'
import { Check, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface ProsConsBoxProps {
  pros?: string[]
  cons?: string[]
  title?: string
}

export const ProsConsBox: React.FC<ProsConsBoxProps> = ({
  pros = [],
  cons = [],
  title,
}) => {
  if (!pros.length && !cons.length) return null

  return (
    <div className="my-8 space-y-4">
      {title && <h4 className="text-xl font-bold tracking-tight">{title}</h4>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pros Card */}
        <Card className="border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Check className="h-5 w-5 rounded-full bg-emerald-500/20 p-1" />
              <span>Pros & Strengths</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {pros.map((pro, index) => (
              <div key={index} className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{pro}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cons Card */}
        <Card className="border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <X className="h-5 w-5 rounded-full bg-rose-500/20 p-1" />
              <span>Cons & Drawbacks</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {cons.map((con, index) => (
              <div key={index} className="flex items-start gap-2.5 text-sm">
                <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{con}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
