"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export interface PageAnalysisDataPoint {
  page: string
  views: number
  bounceRate?: number
  avgTimeOnPageSeconds?: number
}

interface PageAnalysisTabProps {
  data?: PageAnalysisDataPoint[]
}

export function PageAnalysisTab({ data }: PageAnalysisTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Page Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground bg-muted/50">
                    Page
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground bg-muted/50">
                    Views
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground bg-muted/50">
                    Bounce
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground bg-muted/50">
                    Avg Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.page} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{row.page}</td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">{row.views}</td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {typeof row.bounceRate === "number" ? `${row.bounceRate.toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {typeof row.avgTimeOnPageSeconds === "number"
                        ? `${Math.round(row.avgTimeOnPageSeconds)}s`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center rounded-lg bg-muted/30 text-sm text-muted-foreground">
            Page analytics unavailable
          </div>
        )}
      </CardContent>
    </Card>
  )
}

