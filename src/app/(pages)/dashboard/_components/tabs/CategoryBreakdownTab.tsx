"use client"

import { CategoryBreakdown, type ChartDataPoint } from "@/components/analytics"

export interface CategoryBreakdownDataPoint {
  category: string
  value: number
  percentage: number
  color: string
}

interface CategoryBreakdownTabProps {
  data?: CategoryBreakdownDataPoint[]
}

export function CategoryBreakdownTab({ data }: CategoryBreakdownTabProps) {
  const pieChartData: ChartDataPoint[] | undefined = data?.map((item) => ({
    label: item.category,
    value: item.percentage,
  }))

  const performanceData =
    data?.map((item) => ({ category: item.category, percentage: item.percentage })) ?? undefined

  return (
    <CategoryBreakdown
      data={data}
      pieChartData={pieChartData}
      performanceData={performanceData}
    />
  )
}

