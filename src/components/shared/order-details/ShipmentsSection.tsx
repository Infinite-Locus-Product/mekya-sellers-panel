"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { OrderDetailFulfillmentTimelineTitleIcon } from "@/assets/icons/order-management"
import {
  createShipment,
  fulfillOrder,
  getWarehouseCandidates,
  type FulfillmentStatus,
  type WarehouseCandidate,
} from "@/lib/api/orders"
import { StatusBadge, type StatusVariant } from "@/components/shared/StatusBadge"
import type { OrderDetailUnfulfilledLine, ShipmentDisplay } from "./types"
import { ShipmentActions } from "./ShipmentActions"
import { CancelShipmentItemAction } from "./CancelShipmentItemAction"
import { canEditShipmentItems } from "./utils"
import { formatOrderDate } from "@/lib/utils"

const STEP_KEY_VARIANT: Record<FulfillmentStatus, StatusVariant> = {
  pending: "pending",
  order_placed: "processing",
  processing: "processing",
  ready_for_dispatch: "pending",
  ready: "pending",
  shipped: "shipped",
  in_transit: "shipped",
  delivered: "delivered",
  cancelled: "canceled",
}

/** No stepper — just a flat status badge, matching the mockup's one-badge-per-row design. */
function shipmentStatusVariant(shipment: ShipmentDisplay): StatusVariant {
  const key = shipment.stepper.steps.find(
    (s) => s.label.toLowerCase() === shipment.stepper.currentStep.toLowerCase()
  )?.key
  return key ? STEP_KEY_VARIANT[key] : "processing"
}

/** Shown when an order has no shipments yet — creates the first one via POST .../fulfill. */
function CreateShipmentPrompt({ orderId, onDone }: Readonly<{ orderId: string; onDone?: () => void }>) {
  const [open, setOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [courier, setCourier] = useState("")
  const [trackingUrl, setTrackingUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {
    setIsSubmitting(true)
    try {
      await fulfillOrder(orderId, {
        ...(trackingNumber.trim() ? { tracking_number: trackingNumber.trim() } : {}),
        ...(courier.trim() ? { courier: courier.trim() } : {}),
        ...(trackingUrl.trim() ? { tracking_url: trackingUrl.trim() } : {}),
      })
      toast.success("Shipment created")
      setOpen(false)
      setTrackingNumber("")
      setCourier("")
      setTrackingUrl("")
      onDone?.()
    } catch (err) {
      toast.error("Could not create shipment", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) {
    return (
      <Button type="button" size="sm" onClick={() => setOpen(true)} className="h-8 text-xs">
        Create Shipment
      </Button>
    )
  }

  return (
    <div className="max-w-xs space-y-2">
      <Input
        placeholder="Courier (optional)"
        value={courier}
        onChange={(e) => setCourier(e.target.value)}
        className="h-8 text-sm"
      />
      <Input
        placeholder="Tracking number (optional)"
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        className="h-8 text-sm"
      />
      <Input
        placeholder="Tracking URL (optional)"
        value={trackingUrl}
        onChange={(e) => setTrackingUrl(e.target.value)}
        className="h-8 text-sm"
      />
      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={isSubmitting} onClick={submit} className="h-7 text-xs">
          {isSubmitting ? "Creating…" : "Create Shipment"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => setOpen(false)}
          className="h-7 text-xs"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

/** Warehouse picker for a new shipment covering the caller's selected lines — fetches candidates
 *  (nearest-then-least-busy) for the order's delivery pincode once opened. */
function WarehousePickerModal({
  open,
  onOpenChange,
  orderId,
  deliveryPincode,
  selectedLines,
  onDone,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  deliveryPincode: string | null | undefined
  selectedLines: OrderDetailUnfulfilledLine[]
  onDone?: () => void
}>) {
  const [candidates, setCandidates] = useState<WarehouseCandidate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open || !deliveryPincode) return
    let cancelled = false
    setIsLoading(true)
    getWarehouseCandidates(orderId, deliveryPincode)
      .then((result) => {
        if (cancelled) return
        setCandidates(result)
        setSelectedWarehouseId(result[0]?.saleor_warehouse_id ?? "")
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load warehouse candidates")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, orderId, deliveryPincode])

  const confirm = async () => {
    if (!deliveryPincode) return
    setIsSubmitting(true)
    try {
      await createShipment(orderId, {
        delivery_pincode: deliveryPincode,
        order_lines: selectedLines.map((l) => ({
          order_line_id: l.orderLineId,
          sku_id: l.skuId,
          quantity: l.quantity,
        })),
        ...(selectedWarehouseId ? { override_saleor_warehouse_id: selectedWarehouseId } : {}),
      })
      toast.success("Shipment created")
      onDone?.()
    } catch (err) {
      toast.error("Could not create shipment", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Choose a warehouse</DialogTitle>
        </DialogHeader>
        {!deliveryPincode ? (
          <p className="text-xs text-muted-foreground">
            No delivery pincode on file for this order — can&apos;t look up warehouse candidates.
          </p>
        ) : isLoading ? (
          <p className="text-xs text-muted-foreground">Loading warehouses…</p>
        ) : candidates.length === 0 ? (
          <p className="text-xs text-muted-foreground">No warehouses found for this delivery pincode.</p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {candidates.map((c) => (
              <label
                key={c.saleor_warehouse_id}
                className="flex items-center gap-2 rounded-md border border-border p-2 text-xs sm:text-sm"
              >
                <input
                  type="radio"
                  name="warehouse"
                  checked={selectedWarehouseId === c.saleor_warehouse_id}
                  onChange={() => setSelectedWarehouseId(c.saleor_warehouse_id)}
                  className="size-3.5"
                />
                <span className="flex-1">
                  <span className="font-medium text-foreground">{c.name}</span> — {c.city} ({c.pincode})
                  {c.distance_km != null ? ` · ${c.distance_km.toFixed(1)} km` : ""} · {c.open_shipments} open shipments
                </span>
              </label>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting || !deliveryPincode || !selectedWarehouseId}
            onClick={confirm}
          >
            {isSubmitting ? "Creating…" : "Confirm & create shipment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Checkbox selection over an order's unfulfilled lines, feeding the warehouse picker to create a
 *  shipment covering just the selected items (splitting the order across shipments/warehouses). */
function MakeShipmentPanel({
  orderId,
  deliveryPincode,
  unfulfilledLines,
  onDone,
}: Readonly<{
  orderId: string
  deliveryPincode: string | null | undefined
  unfulfilledLines: OrderDetailUnfulfilledLine[]
  onDone?: () => void
}>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pickerOpen, setPickerOpen] = useState(false)

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedLines = unfulfilledLines.filter((l) => selectedIds.has(l.orderLineId))

  return (
    <div className="rounded-md border border-dashed border-border bg-white p-4">
      <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
        Select items to fulfil in a new shipment — pick a subset to split across warehouses.
      </p>
      <div className="mb-3 space-y-1.5">
        {unfulfilledLines.map((line) => (
          <label key={line.orderLineId} className="flex items-center gap-2 text-xs sm:text-sm">
            <input
              type="checkbox"
              checked={selectedIds.has(line.orderLineId)}
              onChange={() => toggle(line.orderLineId)}
              className="size-3.5"
            />
            <span>
              {line.productName} × {line.quantity}
            </span>
          </label>
        ))}
      </div>
      <Button
        type="button"
        size="sm"
        disabled={selectedLines.length === 0}
        onClick={() => setPickerOpen(true)}
        className="h-8 text-xs"
      >
        Make Shipment with Selected Items
      </Button>
      <WarehousePickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        orderId={orderId}
        deliveryPincode={deliveryPincode}
        selectedLines={selectedLines}
        onDone={() => {
          setPickerOpen(false)
          setSelectedIds(new Set())
          onDone?.()
        }}
      />
    </div>
  )
}

/** One flat row per Saleor fulfillment — a status badge and a single contextual action button, no
 *  stepper. Orders with no shipments yet skip the "Shipments" card wrapper entirely and go
 *  straight to the item-selection + warehouse-CTA flow (matches the mockup). */
export function ShipmentsSection({
  shipments,
  orderId,
  unfulfilledLines,
  deliveryPincode,
  onRefresh,
}: Readonly<{
  shipments: ShipmentDisplay[]
  orderId: string
  unfulfilledLines?: OrderDetailUnfulfilledLine[]
  deliveryPincode?: string | null
  onRefresh?: () => void
}>) {
  if (shipments.length === 0) {
    return (
      <section aria-label="Fulfill this order" className="contents">
        {unfulfilledLines && unfulfilledLines.length > 0 ? (
          <MakeShipmentPanel
            orderId={orderId}
            deliveryPincode={deliveryPincode}
            unfulfilledLines={unfulfilledLines}
            onDone={onRefresh}
          />
        ) : (
          <div className="rounded-md border border-dashed border-border bg-white p-4">
            <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
              No shipments yet — create one to start fulfilling this order.
            </p>
            <CreateShipmentPrompt orderId={orderId} onDone={onRefresh} />
          </div>
        )}
      </section>
    )
  }

  return (
    <section aria-labelledby="order-detail-shipments-heading" className="contents">
      <Card className="flex flex-col overflow-hidden rounded-[5px] border border-border bg-[#E8E9E8]/30 shadow-none">
        <CardHeader className="space-y-0 pb-0">
          <CardTitle
            id="order-detail-shipments-heading"
            className="flex items-center gap-2 text-base sm:text-lg"
          >
            <OrderDetailFulfillmentTimelineTitleIcon />
            {shipments.length > 1 ? `Shipments (${shipments.length})` : "Shipment"}
          </CardTitle>
          <hr className="mt-4 border-0 border-t border-border" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          {shipments.map((shipment, index) => {
            // Items can only be pulled out of a parcel that hasn't gone out yet — the
            // backend voids and repacks it, which is impossible once it's with a courier.
            const itemsEditable = canEditShipmentItems(
              shipment.stepper.currentStep,
              shipment.stepper.steps,
            );
            return (
              <div
                key={shipment.id}
                className="rounded-md border border-border bg-white p-3 sm:p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                      <span className="font-medium text-foreground">
                        {shipments.length > 1 ? `Shipment ${index + 1}` : "Shipment"} · {formatOrderDate(shipment.createdAt)}
                      </span>
                      {shipment.warehouse ? <span>{shipment.warehouse}</span> : null}
                      {shipment.trackingNumber ? <span>Tracking: {shipment.trackingNumber}</span> : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge variant={shipmentStatusVariant(shipment)} className="w-auto px-3">
                      {shipment.stepper.currentStep}
                    </StatusBadge>
                    <ShipmentActions
                      orderId={orderId}
                      fulfillmentId={shipment.id}
                      currentStep={shipment.stepper.currentStep}
                      steps={shipment.stepper.steps}
                      onDone={onRefresh}
                    />
                  </div>
                </div>

                {/* One row per SKU, so quantities are legible and each item is actionable. */}
                {shipment.items.length > 0 ? (
                  <ul className="mt-3 divide-y divide-border border-t border-border">
                    {shipment.items.map((item, itemIndex) => (
                      <li
                        key={item.orderLineId ?? `${shipment.id}-${itemIndex}`}
                        className="flex flex-wrap items-center justify-between gap-2 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-foreground sm:text-sm">
                            {item.name}
                          </p>
                          {item.sku ? (
                            <p className="truncate text-[11px] text-muted-foreground">{item.sku}</p>
                          ) : null}
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground sm:text-sm">
                          Qty {item.quantity}
                        </span>
                        <div className="shrink-0">
                          {itemsEditable && item.orderLineId && item.quantity > 0 ? (
                            <CancelShipmentItemAction
                              orderId={orderId}
                              fulfillmentId={shipment.id}
                              orderLineId={item.orderLineId}
                              productName={item.name}
                              packedQuantity={item.quantity}
                              onDone={onRefresh}
                            />
                          ) : (
                            // Keeps the column aligned and makes "no action here" explicit —
                            // an empty cell reads as a missing button. A row with no
                            // orderLineId can't be acted on: nothing identifies it to the API.
                            <span
                              className="text-[11px] text-muted-foreground"
                              title={
                                itemsEditable
                                  ? "This item can't be cancelled individually."
                                  : "Items can only be cancelled before dispatch."
                              }
                            >
                              —
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
          {unfulfilledLines && unfulfilledLines.length > 0 ? (
            <MakeShipmentPanel
              orderId={orderId}
              deliveryPincode={deliveryPincode}
              unfulfilledLines={unfulfilledLines}
              onDone={onRefresh}
            />
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}
