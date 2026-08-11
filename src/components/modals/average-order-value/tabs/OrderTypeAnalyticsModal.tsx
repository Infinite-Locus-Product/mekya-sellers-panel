"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { TwoSeriesLineChart } from "@/components/analytics"

export interface OrderTypeDataPoint {
  label: string
  b2b: number
  b2c: number
}

interface OrderTypeAnalyticsModalProps {
  data?: OrderTypeDataPoint[]
}

const B2B_COLOR = "#38BDF8"
const B2C_COLOR = "#D97706"

export function OrderTypeAnalyticsModal({ data }: OrderTypeAnalyticsModalProps) {
  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-foreground font-medium text-lg">
          <TrendingUp className="h-5 w-5" />
          AOV by Order Type (B2B/B2C)
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="relative h-96 w-full">
          {data && data.length > 0 ? (
            <TwoSeriesLineChart
              data={data.map((d) => ({ label: d.label, a: d.b2b, b: d.b2c }))}
              seriesALabel="B2B"
              seriesBLabel="B2C"
              seriesAColor={B2B_COLOR}
              seriesBColor={B2C_COLOR}
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
