"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { TwoSeriesLineChart } from "@/components/analytics"

export interface CustomerTypeDataPoint {
  label: string
  new: number
  returning: number
}

interface CustomerTypeAnalyticsModalProps {
  data?: CustomerTypeDataPoint[]
  /** Within-selected-period proxy, not lifetime history — surfaced from the
   *  backend so this isn't mistaken for a true new-vs-returning classification. */
  note?: string | null
}

const NEW_COLOR = "#7AD3C7"
const RETURNING_COLOR = "#D4775D"

export function CustomerTypeAnalyticsModal({ data, note }: CustomerTypeAnalyticsModalProps) {
  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-foreground font-medium text-lg">
          <Users className="h-5 w-5" />
          AOV by Customer Type (New/Returning)
        </CardTitle>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="relative h-96 w-full">
          {data && data.length > 0 ? (
            <TwoSeriesLineChart
              data={data.map((d) => ({ label: d.label, a: d.new, b: d.returning }))}
              seriesALabel="New"
              seriesBLabel="Returning"
              seriesAColor={NEW_COLOR}
              seriesBColor={RETURNING_COLOR}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">No data for the selected period.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
