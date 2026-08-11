"use client"

import { SnapshotBreakdownPanel } from "@/components/shared/SnapshotBreakdownPanel"

export interface ReturnGenderDataPoint {
  type: string
  label: string
  percentage: number
  count: number
  color: string
}

interface ProductCategoriesTabProps {
  /** Gender breakdown of the returned products, not category — the same resolution the
   *  seller Sales Volume modal uses (Gender attribute, falling back to root category name). */
  data?: ReturnGenderDataPoint[]
}

/** File kept as `ProductCategoriesTab` (import path referenced elsewhere); the tab itself
 *  shows a Gender breakdown, not product category. */
export function ProductCategoriesTab({ data }: Readonly<ProductCategoriesTabProps>) {
  return (
    <SnapshotBreakdownPanel
      data={data}
      title="Returns by Gender"
      detailsTitle="Returns by Gender Details"
      unitLabel="Returns"
      emptyMessage="No returns in this period"
    />
  )
}
