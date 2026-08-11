"use client"

import { SnapshotBreakdownPanel } from "@/components/shared/SnapshotBreakdownPanel"

export interface ReturnRateDataPoint {
  type: string
  label: string
  percentage: number
  count: number
  color: string
}

interface ReturnRateTabProps {
  /** Completed (qc_passed) vs still-in-progress return requests. */
  data?: ReturnRateDataPoint[]
}

export function ReturnRateTab({ data }: Readonly<ReturnRateTabProps>) {
  return (
    <SnapshotBreakdownPanel
      data={data}
      title="Return Rate"
      detailsTitle="Return Rate Details"
      unitLabel="Returns"
      emptyMessage="No returns in this period"
    />
  )
}
