"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { ReturnTypeIcon, ExchangeTypeIcon } from "@/assets/icons"

export interface ReturnItemLine {
  product: string
  sku: string
  quantity: number
  price: string
  total: string
}

export interface ReturnDetailsData {
  returnId: string
  orderId: string
  vendor: string
  requestDate: string
  refundAmount: string
  requestType: "return" | "exchange"
  reasonForReturn: string
  items: ReturnItemLine[]
}

interface ReturnDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: ReturnDetailsData | null
  onReject?: (data: ReturnDetailsData) => void
  onApprove?: (data: ReturnDetailsData) => void
}

export function ReturnDetailsModal({
  open,
  onOpenChange,
  data,
  onReject,
  onApprove,
}: ReturnDetailsModalProps) {
  if (!data) return null

  const grandTotal = data.items.reduce(
    (sum, item) => sum + parseFloat(item.total.replace(/[₹,]/g, "")) || 0,
    0
  )
  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(grandTotal)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium">Return and Exchange Details</DialogTitle>
        </DialogHeader>
        <div className="h-px mt-2 mb-2 w-full bg-[#E8E9E8]">

        </div>
        <div className="space-y-5 pt-2">
          <div className="rounded-sm bg-[#E8E9E8] p-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium pb-2 ">
                  Vendor Name
                </p>
                <p className="text-xs font-medium">{data.vendor}</p>
              </div>
              <div>
                <p className="text-sm font-medium pb-2 ">
                  Order ID
                </p>
                <p className="text-xs font-medium">{data.orderId}</p>
              </div>
              <div>
                <p className="text-sm font-medium pb-2 ">
                  Request Type
                </p>
                <p className="flex items-center gap-1.5 text-xs font-medium capitalize">
                  <span className="flex items-center justify-center" aria-hidden>
                    {String(data.requestType).toLowerCase() === "return" ? (
                      <ReturnTypeIcon />
                    ) : (
                      <ExchangeTypeIcon />
                    )}
                  </span>
                  {data.requestType}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium pb-2 ">
                  Request Date
                </p>
                <p className="text-xs font-medium">{data.requestDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium pb-2 ">
                  Refund Amount
                </p>
                <p className="text-xs font-medium">{data.refundAmount}</p>
              </div>

            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Reason for return</p>
            <div className="rounded-sm bg-[#E8E9E8] p-3">
              <p className="text-sm text-foreground pb-4">{data.reasonForReturn}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Items to return</p>
            <div className="rounded-md bg-[#E8E9E8] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium">
                      Product
                    </th>
                    <th className="px-3 py-2 text-left font-medium">SKU</th>
                    <th className="px-3 py-2 text-left font-medium">
                      Quantity
                    </th>
                    <th className="px-3 py-2 text-left font-medium">Price</th>
                    <th className="px-3 py-2 text-right font-medium">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, index) => (
                    <tr
                      key={`${item.sku}-${index}`}
                      className="border-b bg-white border-border/50"
                    >
                      <td className="px-3 py-2">{item.product}</td>
                      <td className="px-3 py-2">{item.sku}</td>
                      <td className="px-3 py-2">{item.quantity}</td>
                      <td className="px-3 py-2">{item.price}</td>
                      <td className="px-3 py-2 text-right">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30 font-medium">
                    <td
                      colSpan={4}
                      className="px-3 py-2"
                    >
                      TOTAL
                    </td>
                    <td className="px-3 py-2 text-right">{formattedTotal}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex  justify-between gap-4 pt-2">
            <Button
              type="button"
              variant="destructive"
              className="gap-2 bg-[#FCDBDB] text-[#660101] hover:bg-[#FCDBDB] w-full"
              onClick={() => {
                onReject?.(data)
                onOpenChange(false)
              }}
            >
              <X className="h-4 w-4" />
              Reject
            </Button>
            <Button
              type="button"
              className="gap-2 bg-[#DBFCE7] text-[#016630] hover:bg-[#DBFCE7] w-full"
              onClick={() => {
                onApprove?.(data)
                onOpenChange(false)
              }}
            >
              <Check className="h-4 w-4" />
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
