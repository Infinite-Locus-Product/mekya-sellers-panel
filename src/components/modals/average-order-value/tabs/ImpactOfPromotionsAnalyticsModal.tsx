"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { TwoSeriesLineChart } from "@/components/analytics"

const DISCOUNTED_STROKE = "#1E293B"
const REGULAR_STROKE = "#15803D"

export interface ImpactOfPromotionsDataPoint {
  label: string
  discountedOrders: number
  regularOrders: number
}

interface ImpactOfPromotionsAnalyticsModalProps {
  data?: ImpactOfPromotionsDataPoint[]
}

/**
 * Discounted vs regular order counts.
 *
 * Line only and no 1D/1W/1M/1Y control — the modal's date picker owns the range. Counts,
 * not currency, so the tooltip carries no ₹ and the axis isn't divided by 1000.
 */
export function ImpactOfPromotionsAnalyticsModal({
  data,
}: Readonly<ImpactOfPromotionsAnalyticsModalProps>) {
  const points = data ?? []
  const hasData = points.some(
    (point) => point.discountedOrders > 0 || point.regularOrders > 0
  )

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-foreground">
          <TrendingUp className="h-5 w-5" />
          Impact of Promotions
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="relative h-96 w-full">
          {hasData ? (
            <TwoSeriesLineChart
              data={points.map((point) => ({
                label: point.label,
                a: point.discountedOrders,
                b: point.regularOrders,
              }))}
              seriesALabel="Discounted Orders"
              seriesBLabel="Regular Orders"
              seriesAColor={DISCOUNTED_STROKE}
              seriesBColor={REGULAR_STROKE}
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
