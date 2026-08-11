"use client"

import { SnapshotBreakdownPanel } from "@/components/shared/SnapshotBreakdownPanel"

export interface ReturnReasonDataPoint {
  type: string
  label: string
  percentage: number
  count: number
  color: string
}

interface ReturnReasonsTabProps {
  /** Real reason codes from `CreateReturnRequestPayload.reason_code` — see the backend's
   *  `application.return_exchange.returns_analytics` module. */
  data?: ReturnReasonDataPoint[]
}

export function ReturnReasonsTab({ data }: Readonly<ReturnReasonsTabProps>) {
  return (
    <SnapshotBreakdownPanel
      data={data}
      title="Return Reasons"
      detailsTitle="Return Reasons Details"
      unitLabel="Returns"
      emptyMessage="No returns in this period"
    />
  )
}
