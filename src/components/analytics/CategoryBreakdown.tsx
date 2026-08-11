"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LineChart } from "lucide-react"
import { PieChart } from "./PieChart"
import type { ChartDataPoint } from "./PieChart"

interface CategoryData {
  category: string
  value: number
  percentage: number
  color: string
}

interface CategoryBreakdownProps {
  data?: CategoryData[]
  className?: string
  /** Gender split — Women/Men/Boys/Girls always present, plus "Unspecified" when the
   *  catalogue has no Gender attribute set. Empty renders an explanatory empty state
   *  rather than a chart of zeroes. */
  pieChartData?: ChartDataPoint[]
  /** Per top-level Saleor category (Ethnic Wear, Topwear, Swimwear…). */
  performanceData?: Array<{
    category: string
    percentage: number
  }>
}

/** Fixed colour per bucket, so a gender keeps its colour even when another drops to
 *  zero and the row order shifts. "Unspecified" is deliberately grey — it reads as
 *  missing data, not as a fifth audience. */
const GENDER_COLORS: Record<string, string> = {
  Women: "#94FAD2",
  Men: "#76CAF3",
  Boys: "#FB9E9F",
  Girls: "#8585F1",
  // A real audience, so it gets a colour of its own rather than the grey reserved for
  // "nobody classified this".
  Unisex: "#FBBF77",
  Unspecified: "#CBD5E1",
}

const GENDER_FALLBACK_COLOR = "#CBD5E1"

export function CategoryBreakdown({
  data,
  className,
  pieChartData = [],
  performanceData = [],
}: CategoryBreakdownProps) {
  const genderColorAt = (label: string) => GENDER_COLORS[label] ?? GENDER_FALLBACK_COLOR
  const hasGenderData = pieChartData.some((item) => item.value > 0)
  /** "Unspecified" is not a fifth audience and it does not mean unisex — it's revenue from
   *  products with no Gender attribute set. Without this note a seller sees a large grey
   *  slice with no way to tell what it is or how to shrink it. */
  const unspecifiedShare =
    pieChartData.find((item) => item.label === "Unspecified")?.value ?? 0
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Sales by Gender
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasGenderData ? (
            <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <p className="text-sm">No gender data for this period</p>
              <p className="text-xs">
                Set the Gender attribute on your products to see this split.
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="flex-shrink-0 [&>div]:border-0 [&>div]:bg-transparent [&>div]:p-0">
                <PieChart
                  data={pieChartData.filter((item) => item.value > 0)}
                  colors={pieChartData
                    .filter((item) => item.value > 0)
                    .map((item) => genderColorAt(item.label))}
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

              {/* Legend lists all four buckets including the zeroes, so a seller can see
                  that e.g. Girls genuinely sold nothing rather than wondering if it's
                  missing from the chart. */}
              <div className="flex-1 space-y-3">
                {pieChartData.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: genderColorAt(item.label) }}
                    />
                    <span className="text-sm text-foreground flex-1">{item.label}</span>
                    <span className="text-sm font-semibold text-foreground">{item.value}%</span>
                  </div>
                ))}

                {unspecifiedShare > 0 ? (
                  <p className="pt-1 text-xs leading-snug text-muted-foreground">
                    <span className="font-medium">Unspecified</span> is revenue from products
                    with no Gender attribute set — not unisex. Set Gender on those products
                    to move it into the four buckets.
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Category Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {performanceData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No category sales in this period
              </p>
            ) : (
              <div className="space-y-4">
                {performanceData.map((item) => (
                  <div key={item.category} className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-foreground">{item.category}</span>
                    <span className="text-sm font-semibold text-[var(--info-dark)]">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
