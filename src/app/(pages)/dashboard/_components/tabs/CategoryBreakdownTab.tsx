"use client"

import { CategoryBreakdown } from "@/components/analytics/CategoryBreakdown"
import type { ChartDataPoint } from "@/components/analytics"

interface CategoryBreakdownTabProps {
  data?: Array<{
    category: string
    value: number
    percentage: number
    color: string
  }>
  pieChartData?: ChartDataPoint[]
  performanceData?: Array<{
    category: string
    percentage: number
  }>
}

const DEFAULT_PIE_CHART_DATA: ChartDataPoint[] = [
  { label: "Men", value: 20 },
  { label: "Boys", value: 40 },
  { label: "Women", value: 25 },
  { label: "Girls", value: 15 },
]

const DEFAULT_PERFORMANCE_DATA = [
  { category: "Ethnic", percentage: 45 },
  { category: "Casual", percentage: 45 },
  { category: "Formal", percentage: 45 },
  { category: "Streetwear", percentage: 45 },
  { category: "Activewear", percentage: 45 },
  { category: "Sleep & Lounge", percentage: 45 },
]

export function CategoryBreakdownTab({
  data,
  pieChartData = DEFAULT_PIE_CHART_DATA,
  performanceData = DEFAULT_PERFORMANCE_DATA,
}: CategoryBreakdownTabProps) {
  return (
    <CategoryBreakdown data={data} pieChartData={pieChartData} performanceData={performanceData} />
  )
}
