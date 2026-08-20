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
  /** Delivered vs returned *items*, from the shared per-unit status derivation — not a
   *  count of return requests, so these no longer sum to the Returns KPI. */
  data?: ReturnRateDataPoint[]
}

export function ReturnRateTab({ data }: Readonly<ReturnRateTabProps>) {
  return (
    <SnapshotBreakdownPanel
      data={data}
      title="Return Rate"
      detailsTitle="Return Rate Details"
      unitLabel="Items"
      emptyMessage="No delivered or returned items in this period"
    />
  )
}
