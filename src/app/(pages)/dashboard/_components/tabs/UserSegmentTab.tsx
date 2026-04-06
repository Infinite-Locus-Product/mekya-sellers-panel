"use client"

import { formatNumber } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart } from "@/components/analytics"
import type { ChartDataPoint } from "@/components/analytics"
import { Users } from "lucide-react"

const BUYERS_COLOR = "#86EFAC"
const SELLERS_COLOR = "#F97316"

export interface UserSegmentData {
  buyersCount: number
  sellersCount: number
}

const DEFAULT_SEGMENT_DATA: UserSegmentData = {
  buyersCount: 20000,
  sellersCount: 40457,
}

interface UserSegmentTabProps {
  data?: UserSegmentData
}

export function UserSegmentTab({ data = DEFAULT_SEGMENT_DATA }: UserSegmentTabProps) {
  const total = data.buyersCount + data.sellersCount
  const buyersPct = total > 0 ? Math.round((data.buyersCount / total) * 100) : 40
  const sellersPct = total > 0 ? Math.round((data.sellersCount / total) * 100) : 60

  const pieData: ChartDataPoint[] = [
    { label: "Buyers", value: buyersPct },
    { label: "Sellers", value: sellersPct },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5" />
            User Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart
            data={pieData}
            colors={[BUYERS_COLOR, SELLERS_COLOR]}
            layout="chart-left"
            labelPosition="right"
            showPercentages={true}
            showLegend={true}
            showTitle={false}
            showFooter={false}
            chartSize={240}
            outerRadius={90}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5" />
            User Segment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Buyers</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatNumber(data.buyersCount)}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${buyersPct}%`,
                    backgroundColor: BUYERS_COLOR,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Sellers</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatNumber(data.sellersCount)}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${sellersPct}%`,
                    backgroundColor: SELLERS_COLOR,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
