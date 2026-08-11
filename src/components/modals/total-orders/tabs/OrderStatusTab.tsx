"use client"

import { SnapshotBreakdownPanel } from "@/components/shared/SnapshotBreakdownPanel"

export interface OrderStatusDataPoint {
  type: string
  label: string
  percentage: number
  /** Order count in this bucket. Named `customers` for backwards compatibility with the
   *  original mock shape; the UI has always labelled it "Orders". */
  customers: number
  color: string
}

interface OrderStatusTabProps {
  data?: OrderStatusDataPoint[]
}

export function OrderStatusTab({ data }: Readonly<OrderStatusTabProps>) {
  return (
    <SnapshotBreakdownPanel
      // No mock fallback: a fabricated split on a seller's own order screen is
      // indistinguishable from real performance.
      data={data?.map((d) => ({ ...d, count: d.customers }))}
      title="Order Status"
      detailsTitle="Order Status Details"
      unitLabel="Orders"
      emptyMessage="No orders in this period"
    />
  )
}
