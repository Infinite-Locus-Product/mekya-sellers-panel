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
import { Check, Undo2, X } from "lucide-react"

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
  /** Long-form feedback from the customer */
  customerFeedback?: string
  /** Pre-selected reason category (dropdown) */
  reasonForReturn?: string
  items: ReturnItemLine[]
}

const REASON_OPTIONS = [
  { value: "defective", label: "Defective product" },
  { value: "wrong_item", label: "Wrong item received" },
  { value: "size_fit", label: "Size / fit issue" },
  { value: "other", label: "Other" },
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

  const grandTotal = data.items.reduce((sum, item) => sum + parseINR(item.total), 0)
  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(grandTotal)

  const feedbackText =
    data.customerFeedback ??
    "Product defective - Clothes are torn and the fabric has been ripped"

  const requestTypeLabel = data.requestType === "exchange" ? "Exchange" : "Return"

  return (
    <>
        {/* Header */}
        <div className="shrink-0 px-[min(1.25vw,24px)] pt-[clamp(12px,0.75vw,16px)]">
          <DialogHeader className="border-b-0 pb-0 mb-0">
            <DialogTitle className="pr-10 text-left text-xl font-medium leading-tight sm:text-2xl">
              Return and Exchange Details
            </DialogTitle>
          </DialogHeader>
          <div className="mt-3 h-px w-full bg-[#E8E9E8]" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-[min(1.25vw,24px)] pb-2 pt-[clamp(10px,0.625vw,12px)]">
          <div className="box-border min-h-[min(7.8125vw,150px)] w-full max-w-[823px] shrink-0 rounded-[5px] bg-[#E8E9E8] p-[clamp(10px,0.833vw,16px)]">
            <div className="grid grid-cols-1 gap-x-[clamp(12px,1.25vw,24px)] gap-y-[clamp(6px,0.52vw,10px)] sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <p className="pb-1 text-[clamp(11px,0.625vw,14px)] font-medium">
                  Customer Name
                </p>
                <p className="text-[clamp(11px,0.677vw,12px)] font-normal leading-snug text-foreground">
                  {data.vendor}
                </p>
              </div>
              <div>
                <p className="pb-1 text-[clamp(11px,0.625vw,14px)] font-medium">
                  Order ID
                </p>
                <p className="text-[clamp(11px,0.677vw,12px)] font-normal leading-snug">{data.orderId}</p>
              </div>
              <div>
                <p className="pb-1 text-[clamp(11px,0.625vw,14px)] font-medium">
                  Request Type
                </p>
                <div className="flex items-center gap-1.5">
                  <Undo2 className="size-[clamp(14px,0.833vw,16px)] shrink-0 text-foreground" aria-hidden />
                  <span className="text-[clamp(11px,0.677vw,12px)] font-normal capitalize">
                    {requestTypeLabel}
                  </span>
                </div>
              </div>

              <div>
                <p className="pb-1 text-[clamp(11px,0.625vw,14px)] font-medium">
                  Request Date
                </p>
                <p className="text-[clamp(11px,0.677vw,13px)] font-medium leading-snug">{data.requestDate}</p>
              </div>
              <div>
                <p className="pb-1 text-[clamp(11px,0.625vw,14px)] font-medium">
                  Refund Amount
                </p>
                <p className="text-[clamp(11px,0.677vw,13px)] font-medium leading-snug">{data.refundAmount}</p>
              </div>
            </div>
          </div>

          <div className="mt-[clamp(10px,0.833vw,16px)] shrink-0">
            <p className="mb-1.5 text-[clamp(12px,0.729vw,14px)] font-medium">Customer feedback</p>
            <div className="rounded-[5px] bg-[#E8E9E8] p-[clamp(10px,0.625vw,12px)]">
              <p className="text-[clamp(11px,0.677vw,13px)] leading-relaxed text-foreground">{feedbackText}</p>
            </div>
          </div>

          <div className="mt-[clamp(10px,0.833vw,16px)] shrink-0">
            <p className="mb-1.5 text-[clamp(12px,0.729vw,14px)] font-medium">Reason for return</p>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger className="h-10 w-full max-w-full rounded-[5px] border border-border bg-[#E8E9E8] px-3 text-left text-[clamp(11px,0.677vw,13px)] text-foreground shadow-none">
                <SelectValue placeholder="Select reason for return" />
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

          <div className="mt-[clamp(10px,0.833vw,16px)] flex min-h-0 flex-1 flex-col">
            <p className="mb-1.5 shrink-0 text-[clamp(12px,0.729vw,14px)] font-medium">Items to return</p>
            <div className="min-h-0 flex-1 overflow-auto rounded-[5px] bg-[#E8E9E8]">
              <table className="w-full min-w-0 border-collapse text-[clamp(10px,0.677vw,13px)]">
                <thead>
                  <tr className="border-b border-border/60 bg-[#E8E9E8]">
                    <th className="px-2 py-2 text-left font-medium">Product</th>
                    <th className="px-2 py-2 text-left font-medium">SKU</th>
                    <th className="px-2 py-2 text-left font-medium">Quantity</th>
                    <th className="px-2 py-2 text-left font-medium">Price</th>
                    <th className="px-2 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, index) => (
                    <tr
                      key={`${item.sku ?? item.product}-${index}`}
                      className="border-b border-border/40 bg-white last:border-b-0"
                    >
                      <td className="max-w-[40%] break-words px-2 py-1.5 align-top sm:max-w-none">
                        {item.product}
                      </td>
                      <td className="px-2 py-1.5 align-top">{item.sku ?? "—"}</td>
                      <td className="px-2 py-1.5 align-top">{item.quantity}</td>
                      <td className="px-2 py-1.5 align-top">{item.price}</td>
                      <td className="px-2 py-1.5 text-right align-top">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#E8E9E8] font-medium">
                    <td colSpan={4} className="px-2 py-2">
                      TOTAL
                    </td>
                    <td className="px-2 py-2 text-right">{formattedTotal}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Footer actions — compact on narrow / short viewports */}
        <div className="flex shrink-0 gap-2 border-t border-[#E8E9E8] px-3 py-2 sm:gap-[clamp(10px,0.833vw,16px)] sm:px-[min(1.25vw,24px)] sm:py-[clamp(12px,0.833vw,16px)] max-[480px]:py-1.5">
          <Button
            type="button"
            variant="destructive"
            className="h-9 min-h-0 flex-1 gap-1.5 px-3 text-xs sm:h-10 sm:gap-2 sm:px-4 sm:text-sm md:h-11 bg-[#FCDBDB] text-[#660101] hover:bg-[#FCDBDB]"
            onClick={() => {
              onReject?.(data)
              onOpenChange(false)
            }}
          >
            <X className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
            Reject
          </Button>
          <Button
            type="button"
            disabled={!canApprove}
            className="h-9 min-h-0 flex-1 gap-1.5 px-3 text-xs sm:h-10 sm:gap-2 sm:px-4 sm:text-sm md:h-11 bg-[#DBFCE7] text-[#016630] hover:bg-[#9CA3AF] disabled:pointer-events-none disabled:opacity-50 disabled:bg-[#C8C8C8] disabled:text-white"
            onClick={() => {
              if (!selectedReason) return
              const label = REASON_OPTIONS.find((o) => o.value === selectedReason)?.label
              onApprove?.({ ...data, reasonForReturn: label ?? data.reasonForReturn })
              onOpenChange(false)
            }}
          >
            <Check className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
            Approve
          </Button>
        </div>
    </>
  )
}

export function ReturnDetailsModal({
  open,
  onOpenChange,
  data,
  onReject,
  onApprove,
}: ReturnDetailsModalProps) {
  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          "!flex !max-w-none flex-col !gap-0 overflow-hidden rounded-[5px] !p-0 " +
          "!left-1/2 !top-1/2 !h-[min(43.3333vw,832px,calc(100dvh-2*clamp(12px,1.25vw,24px)))] " +
          "!w-[min(45.3646vw,871px,calc(100vw-2*clamp(12px,1.25vw,24px)))] !max-h-[calc(100dvh-2*clamp(12px,1.25vw,24px))] " +
          "!-translate-x-1/2 !-translate-y-1/2 " +
          "min-[1920px]:!left-[min(27.2917vw,524px)] min-[1920px]:!top-[min(6.4583vw,124px)] min-[1920px]:!h-[min(43.3333vw,832px)] " +
          "min-[1920px]:!w-[min(45.3646vw,871px)] min-[1920px]:!translate-x-0 min-[1920px]:!translate-y-0"
        }
      >
        <ReturnDetailsModalInner
          key={`${data.orderId}-${open}`}
          data={data}
          onOpenChange={onOpenChange}
          onReject={onReject}
          onApprove={onApprove}
        />
      </DialogContent>
    </Dialog>
  )
}
