"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LineChart } from "lucide-react"
import { PieChartIcon } from "@/assets/icons"
import { PieChart, type ChartDataPoint } from "@/components/analytics"
import { TimeRangeSelector } from "@/components/shared"
import type { TimeRange } from "@/components/shared/TimeRangeSelector"
import { cn } from "@/lib/utils"

export interface TopCategory {
  name: string
  percentage: number
}

interface ColorData {
  color: string
  name: string
  units: number
  percentage: number
  hexCode: string
  topCategories?: TopCategory[]
}

interface ColorTrendsTabProps {
  data?: ColorData[]
  chartData?: ChartDataPoint[]
}

/** Demo data: top performing categories per color (for hover tooltip) */
const DEFAULT_COLOR_DATA: ColorData[] = [
  {
    color: "Light Blue",
    name: "Light Blue",
    units: 650,
    percentage: 22,
    hexCode: "#76CAF3",
    topCategories: [
      { name: "Shirts", percentage: 34 },
      { name: "T-Shirts", percentage: 22 },
      { name: "Kurtas", percentage: 15 },
      { name: "Dresses", percentage: 12 },
      { name: "Trousers", percentage: 8 },
    ],
  },
  {
    color: "Black",
    name: "Black",
    units: 612,
    percentage: 20,
    hexCode: "#000000",
    topCategories: [
      { name: "T-Shirts", percentage: 28 },
      { name: "Shirts", percentage: 24 },
      { name: "Trousers", percentage: 18 },
      { name: "Kurtas", percentage: 14 },
      { name: "Jackets", percentage: 9 },
    ],
  },
  {
    color: "White",
    name: "White",
    units: 512,
    percentage: 18,
    hexCode: "#FFFFFF",
    topCategories: [
      { name: "Shirts", percentage: 32 },
      { name: "Kurtas", percentage: 20 },
      { name: "Dresses", percentage: 14 },
      { name: "T-Shirts", percentage: 12 },
      { name: "Trousers", percentage: 10 },
    ],
  },
  {
    color: "Orange",
    name: "Orange",
    units: 432,
    percentage: 15,
    hexCode: "#F8946A",
    topCategories: [
      { name: "T-Shirts", percentage: 30 },
      { name: "Kurtas", percentage: 22 },
      { name: "Shirts", percentage: 16 },
      { name: "Dresses", percentage: 11 },
      { name: "Accessories", percentage: 8 },
    ],
  },
  {
    color: "Light Green",
    name: "Light Green",
    units: 320,
    percentage: 12,
    hexCode: "#9FFF8C",
    topCategories: [
      { name: "Kurtas", percentage: 26 },
      { name: "Dresses", percentage: 20 },
      { name: "Shirts", percentage: 12 },
      { name: "T-Shirts", percentage: 10 },
      { name: "Trousers", percentage: 7 },
    ],
  },
  {
    color: "Dark Blue",
    name: "Dark Blue",
    units: 120,
    percentage: 10,
    hexCode: "#2C4FBF",
    topCategories: [
      { name: "Shirts", percentage: 38 },
      { name: "Trousers", percentage: 25 },
      { name: "T-Shirts", percentage: 15 },
      { name: "Jackets", percentage: 10 },
      { name: "Kurtas", percentage: 6 },
    ],
  },
  {
    color: "Grey",
    name: "Other",
    units: 100,
    percentage: 9,
    hexCode: "#9CA3AF",
    topCategories: [
      { name: "Accessories", percentage: 28 },
      { name: "T-Shirts", percentage: 20 },
      { name: "Shirts", percentage: 16 },
      { name: "Belts", percentage: 12 },
      { name: "Bags", percentage: 9 },
    ],
  },
]

export function ColorTrendsTab({ data = DEFAULT_COLOR_DATA, chartData }: ColorTrendsTabProps) {
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>("1Y")
  const [chartType, setChartType] = useState<"pie" | "bar" | "line">("pie")

  const colorChartData: ChartDataPoint[] =
    chartData ||
    data.map((item) => ({
      label: item.name,
      value: item.units,
      ...(item.topCategories?.length && { payload: { topCategories: item.topCategories } }),
    }))

  const total = data.reduce((sum, item) => sum + item.units, 0)

  const sortedData = [...data].sort((a, b) => b.units - a.units)

  return (
    <Card className="bg-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Color Trends</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={chartType}
              onValueChange={(value: "pie" | "bar" | "line") => setChartType(value)}
            >
              <SelectTrigger className="w-[140px] bg-white border-border px-3" size="sm">
                <SelectValue placeholder="Pie Chart" />
                <div className="h-4 w-px bg-gray-300 flex-shrink-0" aria-hidden />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">
                  <span className="flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 shrink-0" />
                    Pie Chart
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <TimeRangeSelector
              value={activeTimeRange}
              onValueChange={setActiveTimeRange}
              activeClassName="bg-primary text-primary-foreground"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="flex items-start gap-6 max-w-full">
          <div className="flex-shrink-0 flex items-center justify-center">
            <PieChart
              data={colorChartData}
              timeRange={activeTimeRange}
              colors={data.map((item) => item.hexCode)}
              layout="chart-center"
              labelPosition="hidden"
              showLegend={false}
              showFooter={false}
              chartSize={280}
              outerRadius={110}
              customTooltip={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const entry = payload[0] as { payload?: { topCategories?: TopCategory[] } }
                const topCategories = entry?.payload?.topCategories?.slice(0, 3) ?? []
                return (
                  <div className="min-w-[200px] px-4 py-3 bg-gray-800 text-white rounded-md shadow-lg border border-gray-700">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-white">
                      Top Performing Categories
                    </p>
                    {topCategories.length ? (
                      <ul className="space-y-1.5 text-sm list-disc list-inside text-white">
                        {topCategories.map((cat) => (
                          <li key={cat.name}>
                            {cat.name} - {cat.percentage}%
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-300">No category data</p>
                    )}
                  </div>
                )
              }}
            />
          </div>

          <div className="flex-1 space-y-3 pt-2 min-w-0">
            {sortedData.map((item) => (
              <div key={item.name} className="flex items-center gap-3 text-sm rounded-full">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: item.hexCode,
                    border: item.hexCode === "#FFFFFF" ? "1px solid hsl(var(--border))" : "none",
                  }}
                />
                <span className="text-foreground">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">
                    {" "}: {item.units} Units ({item.percentage}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
