"use client"

import { HeatmapTable, type HeatmapDataPoint } from "@/components/analytics/HeatmapTable"

interface DeviceHeatmapTabProps {
  data?: HeatmapDataPoint[]
}

export function DeviceHeatmapTab({ data }: DeviceHeatmapTabProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-lg bg-muted/30 text-center space-y-3">
        <p className="text-sm text-muted-foreground">No device heatmap data available</p>
      </div>
    )
  }

  return <HeatmapTable data={data} />
}
