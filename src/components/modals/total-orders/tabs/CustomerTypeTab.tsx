"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { TwoSeriesLineChart } from "@/components/analytics"

const RETURNING_STROKE = "#38BDF8"
const NEW_STROKE = "#D97706"

export interface CustomerTypeDataPoint {
  label: string
  returning: number
  new: number
}

interface CustomerTypeTabProps {
  data?: CustomerTypeDataPoint[]
}

/**
 * Orders split by whether the buyer had ordered from this seller before.
 *
 * "New" means the order is that customer's first ever with this seller — the backend
 * scans the seller's full history to decide, so a long-standing customer ordering inside
 * the selected window is correctly counted as returning.
 */
export function CustomerTypeTab({ data }: Readonly<CustomerTypeTabProps>) {
  const points = data ?? []
  const hasData = points.some((point) => point.returning > 0 || point.new > 0)

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-foreground">
          <TrendingUp className="h-5 w-5" />
          Customer Type
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="relative h-96 w-full">
          {hasData ? (
            <TwoSeriesLineChart
              data={points.map((point) => ({
                label: point.label,
                a: point.returning,
                b: point.new,
              }))}
              seriesALabel="Returning Customers"
              seriesBLabel="New Customers"
              seriesAColor={RETURNING_STROKE}
              seriesBColor={NEW_STROKE}
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
