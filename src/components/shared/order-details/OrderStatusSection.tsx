"use client"

import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge, type StatusVariant } from "@/components/shared/StatusBadge"
import { InventoryTypeBadge } from "@/components/shared/InventoryTypeBadge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OrderType } from "@/lib/tableTypes"
import type { B2BFulfillmentStats, OrderDetailsData } from "./types"
import { statusLabelText } from "./utils"

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
  const notesPlaceholder =
    orderType === "B2B" && b2bFulfillmentStats
      ? "Ops Note for Pending Fulfillment."
      : "Add notes of status update..."

  const headingHint =
    orderType === "B2B"
      ? "Wholesale status, inventory class, and partial fulfillment counts when applicable."
      : "Retail order status updates and internal notes."

  return (
    <section aria-labelledby="order-detail-status-heading" className="contents">
      <Card className="bg-[#E8E9E8]/30">
        <CardHeader>
          <CardTitle id="order-detail-status-heading" className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Order Status
          </CardTitle>
          <p className="text-xs text-muted-foreground">{headingHint}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderType === "B2B" && b2bFulfillmentStats ? (
            <>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Current Status</p>
                <span className="inline-flex min-h-[22px] max-w-full items-center justify-center overflow-hidden rounded-full bg-[#E5E5E5] px-3 py-1 text-center text-xs font-medium text-foreground">
                  {b2bFulfillmentStats.fulfilled} Fulfilled
                </span>
              </div>
              <div className="space-y-2 rounded-md border border-border/60 bg-[#F4F4F4]/80 px-3 py-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="font-medium text-foreground tabular-nums">{b2bFulfillmentStats.totalItems}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Fulfilled</span>
                  <span className="font-medium text-foreground tabular-nums">{b2bFulfillmentStats.fulfilled}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Delivered</span>
                  <span className="font-medium text-foreground tabular-nums">{b2bFulfillmentStats.delivered}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-medium text-foreground tabular-nums">{b2bFulfillmentStats.pending}</span>
                </div>
              </div>
              <hr className="border-0 border-t border-border" />
            </>
          ) : orderType === "B2B" ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Current Status</p>
                  <StatusBadge variant={order.status}>{statusLabelText(order.status)}</StatusBadge>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Inventory Type</p>
                  <div className="w-fit max-w-full">
                    <InventoryTypeBadge type={order.inventoryType} />
                  </div>
                </div>
              </div>
              <hr className="border-0 border-t border-border" />
            </>
          ) : (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Current Status</p>
              <StatusBadge variant={order.status}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </StatusBadge>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Update Status</p>
            <Select value={selectedStatus} onValueChange={(value) => onSelectedStatusChange(value as StatusVariant)}>
              <SelectTrigger className="w-full bg-[#E8E9E8]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="partial">Partial Fulfillment</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Admin Notes</p>
            <textarea
              value={adminNotes}
              onChange={(e) => onAdminNotesChange(e.target.value)}
              placeholder={notesPlaceholder}
              className="w-full min-h-[100px] p-3 border border-input rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none bg-[#E8E9E8]"
            />
          </div>
          <Button className="w-full bg-[#122130] text-white hover:bg-gray-800" onClick={onUpdateStatus}>
            Update Status
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
