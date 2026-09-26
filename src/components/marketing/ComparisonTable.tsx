import React from 'react'
import { Check, X, Award, ExternalLink } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ComparisonRow {
  feature: string
  toolAValue: boolean | string
  toolBValue: boolean | string
}

interface ComparisonTableProps {
  toolAName: string
  toolBName: string
  toolAAffiliateUrl?: string
  toolBAffiliateUrl?: string
  rows: ComparisonRow[]
  winnerBadge?: string
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  toolAName,
  toolBName,
  toolAAffiliateUrl,
  toolBAffiliateUrl,
  rows,
  winnerBadge,
}) => {
  return (
    <div className="my-10 space-y-4">
      {winnerBadge && (
        <div className="flex items-center gap-2">
          <Badge variant="accent" className="px-3 py-1 text-sm font-semibold flex items-center gap-1.5">
            <Award className="h-4 w-4" />
            <span>Winner: {winnerBadge}</span>
          </Badge>
        </div>
      )}

      <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[40%] font-bold text-foreground text-base">Key Feature / Criteria</TableHead>
              <TableHead className="w-[30%] text-center font-bold text-foreground text-base">{toolAName}</TableHead>
              <TableHead className="w-[30%] text-center font-bold text-foreground text-base">{toolBName}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-muted/30">
                <TableCell className="font-medium text-sm">{row.feature}</TableCell>

                <TableCell className="text-center">
                  {typeof row.toolAValue === 'boolean' ? (
                    row.toolAValue ? (
                      <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-rose-500 mx-auto" />
                    )
                  ) : (
                    <span className="text-sm font-semibold">{row.toolAValue}</span>
                  )}
                </TableCell>

                <TableCell className="text-center">
                  {typeof row.toolBValue === 'boolean' ? (
                    row.toolBValue ? (
                      <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-rose-500 mx-auto" />
                    )
                  ) : (
                    <span className="text-sm font-semibold">{row.toolBValue}</span>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {(toolAAffiliateUrl || toolBAffiliateUrl) && (
              <TableRow className="bg-muted/20">
                <TableCell className="font-bold">Try Now</TableCell>
                <TableCell className="text-center">
                  {toolAAffiliateUrl && (
                    <Button asChild size="sm" variant="default">
                      <a href={toolAAffiliateUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                        <span>Get {toolAName}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {toolBAffiliateUrl && (
                    <Button asChild size="sm" variant="outline">
                      <a href={toolBAffiliateUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                        <span>Get {toolBName}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
