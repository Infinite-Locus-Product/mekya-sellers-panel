"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { TwoSeriesLineChart } from "@/components/analytics"

const B2B_STROKE = "#38BDF8"
const B2C_STROKE = "#D97706"

export interface OrderTypeDataPoint {
  label: string
  b2b: number
  b2c: number
}

interface OrderTypeTabProps {
  data?: OrderTypeDataPoint[]
}

/**
 * B2B vs B2C order counts over the selected period.
 *
 * No chart-type or 1D/1W/1M/1Y control: the modal's date picker is the single source of
 * the range (and is what actually refetches), and the old range buttons only relabelled
 * points from a fixed month list without changing the data.
 */
export function OrderTypeTab({ data }: Readonly<OrderTypeTabProps>) {
  const points = data ?? []
  const hasData = points.some((point) => point.b2b > 0 || point.b2c > 0)

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-foreground">
          <TrendingUp className="h-5 w-5" />
          Type (B2B/B2C)
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="relative h-96 w-full">
          {hasData ? (
            <TwoSeriesLineChart
              data={points.map((point) => ({
                label: point.label,
                a: point.b2b,
                b: point.b2c,
              }))}
              seriesALabel="B2B"
              seriesBLabel="B2C"
              seriesAColor={B2B_STROKE}
              seriesBColor={B2C_STROKE}
              valuePrefix=""
              valueSuffix=" Orders"
              compactAxis={false}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg bg-muted/30 text-sm text-muted-foreground">
              No orders in this period
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
