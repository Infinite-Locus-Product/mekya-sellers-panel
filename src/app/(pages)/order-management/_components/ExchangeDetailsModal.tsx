"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StatusBadge, type StatusVariant } from "@/components/shared/StatusBadge"
import type { ExchangeOrderStatus, ExchangeSettlementStatus } from "@/lib/api/orders"
import { X } from "lucide-react"

export interface ExchangeDetailsData {
  exchangeId: string
  returnId: string
  originalOrderId: string
  customerName: string
  itemName: string
  sku: string | null
  replacementItemName: string
  replacementSku: string | null
  status: ExchangeOrderStatus
  trackingNumber: string | null
  courier: string | null
  estimatedDeliveryAt: string | null
  dispatchedAt: string | null
  deliveredAt: string | null
  extraPaymentDue: number | null
  refundDue: number | null
  settlementStatus: ExchangeSettlementStatus
  createdAt: string
}

const STATUS_VARIANT: Record<ExchangeOrderStatus, StatusVariant> = {
  pending: "pending",
  processing: "processing",
  ready: "pending",
  shipped: "shipped",
  delivered: "delivered",
}

const STATUS_LABEL: Record<ExchangeOrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  ready: "Ready for pickup",
  shipped: "Shipped",
  delivered: "Delivered",
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

interface ExchangeDetailsModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly data: ExchangeDetailsData | null
}

export function ExchangeDetailsModal({ open, onOpenChange, data }: ExchangeDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-hidden sm:max-w-lg">
        {data ? (
          <div className="flex max-h-[80vh] flex-col gap-4 overflow-hidden p-1">
            <DialogHeader className="shrink-0 space-y-1 text-left">
              <DialogTitle className="text-lg font-semibold">Exchange order details</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Exchange <span className="font-medium text-foreground">{data.exchangeId}</span> · Return{" "}
                <span className="font-medium text-foreground">{data.returnId}</span>
              </p>
            </DialogHeader>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Original order</dt>
                  <dd className="font-medium">{data.originalOrderId}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Customer</dt>
                  <dd className="font-medium">{data.customerName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Original item</dt>
                  <dd className="font-medium">{data.itemName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Original SKU</dt>
                  <dd className="font-medium">{data.sku ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Replacement item</dt>
                  <dd className="font-medium">{data.replacementItemName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Replacement SKU</dt>
                  <dd className="font-medium">{data.replacementSku ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="mt-0.5">
                    <StatusBadge variant={STATUS_VARIANT[data.status]}>{STATUS_LABEL[data.status]}</StatusBadge>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="font-medium">{formatDateTime(data.createdAt)}</dd>
                </div>
              </dl>

              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                <p className="font-medium text-foreground">Shipping</p>
                <dl className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Tracking number</dt>
                    <dd className="font-medium text-foreground">{data.trackingNumber ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Courier</dt>
                    <dd className="font-medium text-foreground">{data.courier ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Estimated delivery</dt>
                    <dd className="font-medium text-foreground">{formatDateTime(data.estimatedDeliveryAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Dispatched at</dt>
                    <dd className="font-medium text-foreground">{formatDateTime(data.dispatchedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Delivered at</dt>
                    <dd className="font-medium text-foreground">{formatDateTime(data.deliveredAt)}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                <p className="font-medium text-foreground">Settlement</p>
                <dl className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="font-medium text-foreground capitalize">
                      {data.settlementStatus.replace(/_/g, " ")}
                    </dd>
                  </div>
                  {data.extraPaymentDue != null ? (
                    <div>
                      <dt className="text-muted-foreground">Extra payment due</dt>
                      <dd className="font-medium text-foreground">
                        ₹{data.extraPaymentDue.toLocaleString("en-IN")}
                      </dd>
                    </div>
                  ) : null}
                  {data.refundDue != null ? (
                    <div>
                      <dt className="text-muted-foreground">Refund due</dt>
                      <dd className="font-medium text-foreground">₹{data.refundDue.toLocaleString("en-IN")}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </div>

            <div className="flex shrink-0 justify-end border-t pt-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                <X className="mr-2 h-4 w-4" aria-hidden />
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
