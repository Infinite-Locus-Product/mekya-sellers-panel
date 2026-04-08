"use client"

import { MultiLineChart, type MultiLineChartDataPoint } from "@/components/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

interface SellerGrowthOverviewTabProps {
  chartData?: MultiLineChartDataPoint[]
  chartTitle?: string
}

export function SellerGrowthOverviewTab({
  chartData,
  chartTitle = "Seller Growth Overview",
}: SellerGrowthOverviewTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {chartTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData?.length ? (
          <MultiLineChart data={chartData} />
        ) : (
          <div className="flex h-96 items-center justify-center rounded-lg bg-muted/30 text-sm text-muted-foreground">
            Seller growth data unavailable
          </div>
        )}
      </CardContent>
    </Card>
  )
}

