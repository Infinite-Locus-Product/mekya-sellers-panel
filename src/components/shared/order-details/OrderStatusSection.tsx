"use client"

import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge, type StatusVariant } from "@/components/shared/StatusBadge"
import { InventoryTypeBadge } from "@/components/shared/InventoryTypeBadge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OrderType } from "@/lib/tableTypes"
import type { B2BFulfillmentStats, OrderDetailsData } from "./types"
import { getOrderStatusUpdateOptions, statusLabelText } from "./utils"

export function OrderStatusSection({
  order,
  orderType,
  b2bFulfillmentStats,
  selectedStatus,
  onSelectedStatusChange,
  adminNotes,
  onAdminNotesChange,
  onUpdateStatus,
}: Readonly<{
  order: Pick<OrderDetailsData, "status" | "inventoryType">
  orderType: OrderType
  b2bFulfillmentStats?: B2BFulfillmentStats
  selectedStatus: StatusVariant
  onSelectedStatusChange: (value: StatusVariant) => void
  adminNotes: string
  onAdminNotesChange: (value: string) => void
  onUpdateStatus: () => void
}>) {
  const isPartialFulfillmentCard = orderType === "B2B" && Boolean(b2bFulfillmentStats)
  const statusUpdateOptions = getOrderStatusUpdateOptions({
    orderType,
    isPartialFulfillmentContext: isPartialFulfillmentCard,
  })

  const notesPlaceholder = "Add notes of status update..."

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
          {orderType === "B2B" && b2bFulfillmentStats ? (
            <>
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
            </>
          ) : orderType === "B2B" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Current Status</p>
                <StatusBadge variant={order.status} className="w-fit max-w-full py-2">{statusLabelText(order.status)}</StatusBadge>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Inventory Type</p>
                <div className="w-fit max-w-full">
                  <InventoryTypeBadge type={order.inventoryType} />
                </div>
              </div>
            </div>
          ) : (
            <>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Current Status</p>
              <StatusBadge variant={order.status} className="w-fit max-w-full">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </StatusBadge>
            </div>
            <hr className="border-0 border-t border-border" />
            </>
          )}

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Update Status</p>
            <div className="flex items-stretch gap-1.5">
              <Select value={selectedStatus} onValueChange={(value) => onSelectedStatusChange(value as StatusVariant)}>
                <SelectTrigger className="h-10 min-h-10 flex-1 bg-[#E8E9E8] shadow-none">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  {statusUpdateOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              {isPartialFulfillmentCard ? "Ops Note for Pending Fulfillment" : "Admin Notes"}
            </p>
            <textarea
              value={adminNotes}
              onChange={(e) => onAdminNotesChange(e.target.value)}
              placeholder={notesPlaceholder}
              className="w-full min-h-[40px] resize-none rounded-sm border border-input bg-[#E8E9E8] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button className="h-10 w-full bg-[#122130] text-white hover:bg-[#122130]/90" onClick={onUpdateStatus}>
            Update Status
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
