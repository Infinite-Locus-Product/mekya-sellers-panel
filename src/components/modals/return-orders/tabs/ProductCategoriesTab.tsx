"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LineChart } from "lucide-react"
import { PieChart } from "@/components/analytics/PieChart"
import type { ChartDataPoint } from "@/components/analytics/PieChart"

interface CategoryData {
  category: string
  value: number
  percentage: number
  color: string
}

interface CategoryBreakdownProps {
  data?: CategoryData[]
  className?: string
  pieChartData?: ChartDataPoint[]
  performanceData?: Array<{
    category: string
    percentage: number
  }>
}

const DEFAULT_PIE_CHART_DATA: ChartDataPoint[] = [
  { label: "Men", value: 20 },
  { label: "Boys", value: 20 },
  { label: "Women", value: 20 },
  { label: "Girls", value: 20 },
  { label: "Kids", value: 20 },
]

const DEFAULT_PERFORMANCE_DATA = [
  { category: "Ethnic", percentage: 10 },
  { category: "Casual", percentage: 10 },
  { category: "Formal", percentage: 10 },
  { category: "Streetwear", percentage: 10 },
  { category: "Activewear", percentage: 10 },
  { category: "Sleep & Lounge", percentage: 10 },
]

const PIE_CHART_COLORS = [
  "#76CAF3", // Men
  "#FB9E9F", // Boys
  "#94FAD2", // Women
  "#8585F1", // Girls
  "#A78BFA", // Kids
]

export function ProductCategoriesTab({
  data,
  className,
  pieChartData = DEFAULT_PIE_CHART_DATA,
  performanceData = DEFAULT_PERFORMANCE_DATA,
}: CategoryBreakdownProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Returns by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-shrink-0 [&>div]:border-0 [&>div]:bg-transparent [&>div]:p-0">
              <PieChart
                data={pieChartData}
                colors={PIE_CHART_COLORS}
                layout="chart-center"
                labelPosition="hidden"
                showPercentages={false}
                showLegend={false}
                showTitle={false}
                showFooter={false}
                chartSize={200}
                outerRadius={80}
              />
            </div>

            <div className="flex-1 space-y-3">
              {pieChartData.map((item, index) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] }}
                  />
                  <span className="text-sm text-foreground flex-1">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Returns by Sub-Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-4">
              {performanceData.map((item) => (
                <div key={item.category} className="flex items-center justify-between py-4 px-4 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium text-foreground">{item.category}</span>
                  <span className="text-sm font-semibold text-[var(--info-dark)]">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
