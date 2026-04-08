"use client"

import { HeatmapTable, type HeatmapDataPoint } from "@/components/analytics"

interface DeviceHeatmapTabProps {
  data?: HeatmapDataPoint[]
}

const DEFAULT_DATA: HeatmapDataPoint[] = [
  { page: "/dashboard", mobile: 24.5, tablet: 18.2, desktop: 14.7 },
  { page: "/orders", mobile: 31.8, tablet: 25.6, desktop: 19.3 },
  { page: "/products", mobile: 42.1, tablet: 36.4, desktop: 28.9 },
]

export function DeviceHeatmapTab({ data = DEFAULT_DATA }: DeviceHeatmapTabProps) {
  return <HeatmapTable data={data} />
}

