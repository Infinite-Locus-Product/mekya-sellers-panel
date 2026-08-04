"use client"

import { Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { B2BFulfillmentStats } from "./types"

/**
 * B2B pre-booking fulfillment-progress breakdown (total/fulfilled/delivered/pending line counts).
 * The plain current-status badge lives in the page header now — this card only renders when
 * there's real line-level progress to show, not just a status pill.
 */
export function OrderStatusSection({
  b2bFulfillmentStats,
}: Readonly<{ b2bFulfillmentStats: B2BFulfillmentStats }>) {
  return (
    <section aria-labelledby="order-detail-status-heading" className="contents">
      <Card className="bg-[#E8E9E8]/30">
        <CardHeader>
          <CardTitle id="order-detail-status-heading" className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Order Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm">Current Status</p>
            <span className="inline-flex min-h-[22px] max-w-full items-center justify-center overflow-hidden rounded-full bg-[#E5E5E5] px-3 py-1 text-center text-xs font-medium text-foreground">
              {b2bFulfillmentStats.fulfilled} Fulfilled
            </span>
          </div>
          <hr className="border-0 border-t border-border" />
          <div className="space-y-2 px-3 py-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="">Total Items</span>
              <span className="font-medium text-foreground tabular-nums">{b2bFulfillmentStats.totalItems}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="">Fulfilled</span>
              <span className="text-[#016630]">{b2bFulfillmentStats.fulfilled}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="">Delivered</span>
              <span className="text-[#016630]">{b2bFulfillmentStats.delivered}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="">Pending</span>
              <span className="text-[#686000]">{b2bFulfillmentStats.pending}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
