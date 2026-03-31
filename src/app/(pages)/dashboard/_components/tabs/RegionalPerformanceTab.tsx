"use client"

import { formatCurrencyINR } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Star } from "lucide-react"
import type { ChartDataPoint } from "@/components/analytics"

interface RegionalData {
  region: string
  numberOfSellers: number
  revenue: number
  averageRating: number
}

interface RegionalPerformanceTabProps {
  data?: Array<{
    region: string
    numberOfSellers?: number
    revenue?: number
    averageRating?: number
    sales?: number
    growth?: number
    color?: string
  }>
  chartData?: ChartDataPoint[]
}

const DEFAULT_REGIONAL_DATA: RegionalData[] = [
  {
    region: "North India",
    numberOfSellers: 98,
    revenue: 850000,
    averageRating: 4.2,
  },
  {
    region: "South India",
    numberOfSellers: 87,
    revenue: 650000,
    averageRating: 4.0,
  },
  {
    region: "West India",
    numberOfSellers: 95,
    revenue: 950000,
    averageRating: 4.4,
  },
  {
    region: "East India",
    numberOfSellers: 62,
    revenue: 250000,
    averageRating: 3.8,
  },
]

export function RegionalPerformanceTab({
  data = DEFAULT_REGIONAL_DATA,
  chartData,
}: RegionalPerformanceTabProps) {
  const formatRevenue = (amount: number) => formatCurrencyINR(amount)

  const isNewFormat =
    data.length > 0 &&
    (data[0].numberOfSellers !== undefined ||
      data[0].revenue !== undefined ||
      data[0].averageRating !== undefined)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Regional Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {data.map((item, index) => {
              if (isNewFormat && item.numberOfSellers !== undefined) {
                return (
                  <div key={item.region} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground mb-3">{item.region}</p>
                        <div>
                          <p className="text-xl font-bold text-foreground">
                            {item.numberOfSellers}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">Sellers</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-8">
                        <div>
                          <p className="text-xl font-bold text-foreground">
                            {item.revenue !== undefined ? formatRevenue(item.revenue) : "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">Revenue</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="text-xl font-bold text-foreground">
                              {item.averageRating !== undefined ? item.averageRating : "N/A"}
                            </p>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">Avg Rating</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={item.region}
                  className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.region}</p>
                    {item.sales !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        {formatCurrencyINR(item.sales)}
                      </p>
                    )}
                  </div>
                  {item.growth !== undefined && (
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold ${
                        item.growth >= 0
                          ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400"
                      }`}
                    >
                      {item.growth >= 0 ? "+" : ""}
                      {item.growth}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
