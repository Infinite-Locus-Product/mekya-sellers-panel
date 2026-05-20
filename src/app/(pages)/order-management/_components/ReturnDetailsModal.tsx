"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Undo2, X } from "lucide-react"

export interface ReturnItemLine {
  product: string
  sku?: string
  quantity: number
  price: string
  total: string
}

export interface ReturnDetailsData {
  returnId?: string
  orderId: string
  /** Shown as Customer Name */
  vendor: string
  requestDate: string
  refundAmount: string
  requestType?: "return" | "exchange"
  customerFeedback?: string
  reasonForReturn?: string
  items: ReturnItemLine[]
}

const REASON_OPTIONS = [
  { value: "order_by_mistake", label: "Ordered by Mistake" },
  { value: "damaged_item", label: "Damaged Item" },
  { value: "wrong_item_received", label: "Wrong Item Received" },
  { value: "not_as_described", label: "Item Not As Described" },
  { value: "size_too_small", label: "Size too Small" },
  { value: "size_too_large", label: "Size too Large" },
] as const

interface ReturnDetailsModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly data: ReturnDetailsData | null
  readonly onReject?: (data: ReturnDetailsData) => void
  readonly onApprove?: (data: ReturnDetailsData) => void
}

function parseINR(value: string) {
  const numeric = Number.parseFloat(String(value ?? "").replaceAll(/[₹,]/g, ""))
  return Number.isFinite(numeric) ? numeric : 0
}

interface ReturnDetailsModalInnerProps {
  readonly data: ReturnDetailsData
  readonly onOpenChange: (open: boolean) => void
  readonly onReject?: (data: ReturnDetailsData) => void
  readonly onApprove?: (data: ReturnDetailsData) => void
}

function ReturnDetailsModalInner({
  data,
  onOpenChange,
  onReject,
  onApprove,
}: ReturnDetailsModalInnerProps) {
  const [selectedReason, setSelectedReason] = useState<string | undefined>(undefined)
  const canApprove = Boolean(selectedReason)

  const itemsTotal = data.items.reduce((sum, row) => sum + parseINR(row.total), 0)

  return (
    <div className="flex max-h-[85vh] flex-col gap-4 overflow-hidden p-1">
      <DialogHeader className="shrink-0 space-y-1 text-left">
        <DialogTitle className="text-lg font-semibold">Return request details</DialogTitle>
        <p className="text-sm text-muted-foreground">
          Order <span className="font-medium text-foreground">{data.orderId}</span>
          {data.returnId ? (
            <>
              {" "}
              · Return <span className="font-medium text-foreground">{data.returnId}</span>
            </>
          ) : null}
        </p>
      </DialogHeader>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Customer</dt>
            <dd className="font-medium">{data.vendor}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Request date</dt>
            <dd className="font-medium">{data.requestDate}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Refund amount</dt>
            <dd className="font-medium">{data.refundAmount}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Request type</dt>
            <dd className="font-medium capitalize">{data.requestType ?? "return"}</dd>
          </div>
        </dl>

        {data.customerFeedback ? (
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <p className="font-medium text-foreground">Customer feedback</p>
            <p className="mt-1 text-muted-foreground">{data.customerFeedback}</p>
            {data.reasonForReturn ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Stated reason: <span className="font-medium text-foreground">{data.reasonForReturn}</span>
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="text-sm font-medium">Reason for decision</p>
          <Select value={selectedReason} onValueChange={setSelectedReason}>
            <SelectTrigger className="w-full sm:max-w-md">
              <SelectValue placeholder="Select a reason to approve" />
            </SelectTrigger>
            <SelectContent>
              {REASON_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Qty</th>
                <th className="px-3 py-2 font-medium">Price</th>
                <th className="px-3 py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((row, i) => (
                <tr key={`${row.product}-${i}`} className="border-b last:border-0">
                  <td className="px-3 py-2">
                    <div className="font-medium">{row.product}</div>
                    {row.sku ? <div className="text-xs text-muted-foreground">SKU {row.sku}</div> : null}
                  </td>
                  <td className="px-3 py-2">{row.quantity}</td>
                  <td className="px-3 py-2">{row.price}</td>
                  <td className="px-3 py-2">{row.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t bg-muted/30">
              <tr>
                <td colSpan={3} className="px-3 py-2 text-right font-medium">
                  Items total
                </td>
                <td className="px-3 py-2 font-medium">₹{itemsTotal.toLocaleString("en-IN")}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t pt-3">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          <X className="mr-2 h-4 w-4" aria-hidden />
          Close
        </Button>
        {onReject ? (
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onReject(data)
              onOpenChange(false)
            }}
          >
            <Undo2 className="mr-2 h-4 w-4" aria-hidden />
            Reject
          </Button>
        ) : null}
        {onApprove ? (
          <Button
            type="button"
            disabled={!canApprove}
            onClick={() => {
              onApprove(data)
              onOpenChange(false)
            }}
          >
            Approve
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function ReturnDetailsModal({
  open,
  onOpenChange,
  data,
  onReject,
  onApprove,
}: ReturnDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden sm:max-w-2xl">
        {data ? (
          <ReturnDetailsModalInner
            data={data}
            onOpenChange={onOpenChange}
            onReject={onReject}
            onApprove={onApprove}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
