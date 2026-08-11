"use client"

import { CategoryBreakdown, type ChartDataPoint } from "@/components/analytics"

export interface CategoryBreakdownDataPoint {
  category: string
  value: number
  percentage: number
  color: string
}

export interface GenderBreakdownDataPoint {
  gender: string
  value: number
  percentage: number
}

interface CategoryBreakdownTabProps {
  /** Top-level Saleor categories — feeds the "Category Performance" list. */
  data?: CategoryBreakdownDataPoint[]
  /** Women/Men/Boys/Girls (+ Unspecified) — feeds the "Sales by Gender" pie. */
  genderData?: GenderBreakdownDataPoint[]
}

export function CategoryBreakdownTab({ data, genderData }: CategoryBreakdownTabProps) {
  // The pie is gender, the list is category — two different cuts of the same sales, so
  // they're fed from two different payload sections rather than the same one twice.
  const pieChartData: ChartDataPoint[] =
    genderData?.map((item) => ({ label: item.gender, value: item.percentage })) ?? []

  const performanceData =
    data?.map((item) => ({ category: item.category, percentage: item.percentage })) ?? []

  return (
    <CategoryBreakdown
      data={data}
      pieChartData={pieChartData}
      performanceData={performanceData}
    />
  )
}

