"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { returnReasonCodeLabel, type ReturnStatus } from "@/lib/tableTypes"
import { Undo2, X } from "lucide-react"

export interface ReturnItemLine {
  orderLineId: string
  product: string
  sku?: string | null
  quantity: number
  resolutionStatus?: string
}

export interface ReturnDetailsData {
  returnId: string
  /** Human-readable order number (saleor_order_number) — display only, no order-detail deep link. */
  orderNumber?: string
  /** Shown as Customer Name */
  vendor: string
  requestDate?: string
  /** Formatted lines_total from the detail response — the amount at stake, not a settled refund. */
  linesTotal: string
  requestType?: "return" | "exchange" | "claim"
  status: ReturnStatus
  reasonCode?: string | null
  reasonDetails?: string
  canApproveRequest?: boolean
  canReject?: boolean
  canAddTracking?: boolean
  canMarkReceived?: boolean
  canQcPass?: boolean
  canQcFail?: boolean
  canConfirmDefective?: boolean
  canConfirmNotDefective?: boolean
  canShipBack?: boolean
  items: ReturnItemLine[]
  /** Set when status is "Rejected". */
  rejectionReason?: string | null
  /** Set by Saleor's refund sync after QC passes (return/claim). */
  refundReference?: string | null
  /** Set on QC pass for exchange-type requests — the new EXC-... order. */
  exchangeOrderId?: string | null
  /** Set on QC fail. */
  qcFailureReason?: string | null
  /** Inbound AWB (customer → warehouse), set via Add tracking. */
  returnTrackingNumber?: string | null
  /** Outbound AWB (warehouse → customer), set once the QC-failed item has been shipped back. */
  reshipTrackingNumber?: string | null
}

export interface AddTrackingPayload {
  returnId: string
  trackingNumber: string
  courier?: string
}

export interface QcPassPayload {
  returnId: string
  note?: string
  refundAmount?: number
}

export interface QcFailPayload {
  returnId: string
  qcFailureReason?: string
}

export interface ConfirmDefectivePayload {
  returnId: string
  isDefective: boolean
}

export interface RejectPayload {
  returnId: string
  note?: string
}

export interface ShipBackPayload {
  returnId: string
  courier?: string
  contactPerson?: string
  contactPhone?: string
}

interface ReturnDetailsModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly data: ReturnDetailsData | null
  readonly onApproveRequest?: (returnId: string) => void
  readonly onAddTracking?: (payload: AddTrackingPayload) => void
  readonly onMarkReceived?: (returnId: string) => void
  readonly onQcPass?: (payload: QcPassPayload) => void
  readonly onQcFail?: (payload: QcFailPayload) => void
  readonly onConfirmDefective?: (payload: ConfirmDefectivePayload) => void
  readonly onReject?: (payload: RejectPayload) => void
  readonly onShipBack?: (payload: ShipBackPayload) => void
}

interface ReturnDetailsModalInnerProps {
  readonly data: ReturnDetailsData
  readonly onOpenChange: (open: boolean) => void
  readonly onApproveRequest?: (returnId: string) => void
  readonly onAddTracking?: (payload: AddTrackingPayload) => void
  readonly onMarkReceived?: (returnId: string) => void
  readonly onQcPass?: (payload: QcPassPayload) => void
  readonly onQcFail?: (payload: QcFailPayload) => void
  readonly onConfirmDefective?: (payload: ConfirmDefectivePayload) => void
  readonly onReject?: (payload: RejectPayload) => void
  readonly onShipBack?: (payload: ShipBackPayload) => void
}

function ReturnDetailsModalInner({
  data,
  onOpenChange,
  onApproveRequest,
  onAddTracking,
  onMarkReceived,
  onQcPass,
  onQcFail,
  onConfirmDefective,
  onReject,
  onShipBack,
}: ReturnDetailsModalInnerProps) {
  const [note, setNote] = useState("")
  const [refundAmount, setRefundAmount] = useState("")
  const [qcFailureReason, setQcFailureReason] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [courier, setCourier] = useState("")
  const [shipCourier, setShipCourier] = useState("")
  const [shipContact, setShipContact] = useState("")
  const [shipPhone, setShipPhone] = useState("")

  const isClaim = data.requestType === "claim"

  // return/exchange/claim all follow the same pipeline now: pending → approved → received →
  // qc_passed, with a defect-check detour and an early pending → rejected branch. There is no
  // "picked up" status — tracking is optional metadata recorded while still "Approved", not a
  // stage of its own, and claims no longer have an approve-claim fast path.
  const showApproveRequest = data.status === "Pending" && data.canApproveRequest !== false
  const showReject = data.status === "Pending" && data.canReject !== false
  const showAddTracking = data.status === "Approved" && data.canAddTracking !== false && Boolean(onAddTracking)
  const showMarkReceived = data.status === "Approved" && data.canMarkReceived !== false
  const showQcPass = data.status === "Received" && data.canQcPass !== false
  const showQcFail = data.status === "Received" && data.canQcFail !== false
  const showConfirmDefective = data.status === "Defect Check"
  const showShipBack =
    data.status === "QC Failed" && data.canShipBack !== false && !data.reshipTrackingNumber && Boolean(onShipBack)

  const submitAddTracking = () => {
    if (!trackingNumber.trim() || !onAddTracking) return
    onAddTracking({
      returnId: data.returnId,
      trackingNumber: trackingNumber.trim(),
      courier: courier.trim() || undefined,
    })
  }

  const submitShipBack = () => {
    if (!onShipBack) return
    onShipBack({
      returnId: data.returnId,
      courier: shipCourier.trim() || undefined,
      contactPerson: shipContact.trim() || undefined,
      contactPhone: shipPhone.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <div className="flex max-h-[85vh] flex-col gap-4 overflow-hidden p-1">
      <DialogHeader className="shrink-0 space-y-1 text-left">
        <DialogTitle className="text-lg font-semibold">
          {data.requestType === "exchange"
            ? "Exchange request details"
            : isClaim
              ? "Claim details"
              : "Return request details"}
        </DialogTitle>
        <p className="text-sm text-muted-foreground">
          Return <span className="font-medium text-foreground">{data.returnId}</span>
          {data.orderNumber ? (
            <>
              {" "}
              · Order <span className="font-medium text-foreground">{data.orderNumber}</span>
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
            <dd className="font-medium">{data.requestDate ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Amount at stake</dt>
            <dd className="font-medium">{data.linesTotal}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Request type</dt>
            <dd className="font-medium capitalize">{data.requestType ?? "return"}</dd>
          </div>
        </dl>

        {data.reasonDetails || data.reasonCode ? (
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <p className="font-medium text-foreground">Customer feedback</p>
            {data.reasonDetails ? <p className="mt-1 text-muted-foreground">{data.reasonDetails}</p> : null}
            {data.reasonCode ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Stated reason: <span className="font-medium text-foreground">{returnReasonCodeLabel(data.reasonCode)}</span>
              </p>
            ) : null}
          </div>
        ) : null}

        {data.status === "Rejected" && data.rejectionReason ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p className="font-medium text-foreground">Rejection reason</p>
            <p className="mt-1 text-muted-foreground">{data.rejectionReason}</p>
          </div>
        ) : null}

        {data.status === "QC Passed" && (data.refundReference || data.exchangeOrderId) ? (
          <div className="rounded-md border border-emerald-600/30 bg-emerald-600/5 p-3 text-sm">
            <p className="font-medium text-foreground">Resolution</p>
            {data.refundReference ? (
              <p className="mt-1 text-muted-foreground">
                Refund reference: <span className="font-medium text-foreground">{data.refundReference}</span>
              </p>
            ) : null}
            {data.exchangeOrderId ? (
              <p className="mt-1 text-muted-foreground">
                Exchange order: <span className="font-medium text-foreground">{data.exchangeOrderId}</span>
              </p>
            ) : null}
          </div>
        ) : null}

        {(data.status === "Approved" || data.returnTrackingNumber) ? (
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <p className="font-medium text-foreground">Pickup tracking</p>
            {data.returnTrackingNumber ? (
              <p className="mt-1 text-muted-foreground">
                Inbound AWB: <span className="font-medium text-foreground">{data.returnTrackingNumber}</span>
              </p>
            ) : (
              <p className="mt-1 text-muted-foreground">Not recorded yet — optional, doesn&apos;t block receiving.</p>
            )}
          </div>
        ) : null}

        {data.status === "QC Failed" || data.status === "Shipped Back" ? (
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <p className="font-medium text-foreground">Reship to customer</p>
            {data.qcFailureReason ? (
              <p className="mt-1 text-muted-foreground">Reason: {data.qcFailureReason}</p>
            ) : null}
            {data.reshipTrackingNumber ? (
              <p className="mt-1 text-muted-foreground">
                Dispatched back to customer — tracking{" "}
                <span className="font-medium text-foreground">{data.reshipTrackingNumber}</span>
              </p>
            ) : (
              <p className="mt-1 text-muted-foreground">Not yet dispatched back to the customer.</p>
            )}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Qty</th>
                <th className="px-3 py-2 font-medium">Resolution</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((row) => (
                <tr key={row.orderLineId} className="border-b last:border-0">
                  <td className="px-3 py-2">{row.product}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.sku ?? "—"}</td>
                  <td className="px-3 py-2">{row.quantity}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.resolutionStatus ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showReject ? (
          <div className="space-y-1.5">
            <label htmlFor="return-note" className="text-sm font-medium">
              Rejection note (optional)
            </label>
            <textarea
              id="return-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={512}
              rows={3}
              className={cn(
                "flex w-full rounded-md border border-input px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              )}
              placeholder="Add a note for this decision"
            />
          </div>
        ) : null}

        {showQcPass ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="return-qc-note" className="text-sm font-medium">
                Note (optional)
              </label>
              <textarea
                id="return-qc-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={512}
                rows={3}
                className="flex w-full rounded-md border border-input px-3 py-2 text-sm placeholder:text-muted-foreground"
                placeholder="Add a note for this decision"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="return-refund" className="text-sm font-medium">
                Refund amount (optional — defaults to full line total)
              </label>
              <Input
                id="return-refund"
                type="number"
                min={0}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
                className="max-w-[200px]"
              />
            </div>
          </div>
        ) : null}

        {showQcFail ? (
          <div className="space-y-1.5">
            <label htmlFor="return-qc-fail-reason" className="text-sm font-medium">
              QC failure reason (optional)
            </label>
            <textarea
              id="return-qc-fail-reason"
              value={qcFailureReason}
              onChange={(e) => setQcFailureReason(e.target.value)}
              maxLength={512}
              rows={2}
              className="flex w-full rounded-md border border-input px-3 py-2 text-sm placeholder:text-muted-foreground"
              placeholder="Why did this item fail QC?"
            />
          </div>
        ) : null}

        {showAddTracking ? (
          <div className="space-y-3 rounded-md border p-3">
            <p className="text-sm font-medium text-foreground">Add pickup tracking (optional)</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Tracking number</label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Tracking number"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Courier (optional)</label>
                <Input
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  placeholder="e.g. Delhivery"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <Button type="button" size="sm" variant="outline" disabled={!trackingNumber.trim()} onClick={submitAddTracking}>
              Save tracking
            </Button>
          </div>
        ) : null}

        {showShipBack ? (
          <div className="space-y-3 rounded-md border p-3">
            <p className="text-sm font-medium text-foreground">Ship item back to customer</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Courier (optional)</label>
                <Input
                  value={shipCourier}
                  onChange={(e) => setShipCourier(e.target.value)}
                  placeholder="e.g. Delhivery"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Contact person (optional)</label>
                <Input
                  value={shipContact}
                  onChange={(e) => setShipContact(e.target.value)}
                  placeholder="Full name"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Contact phone (optional)</label>
                <Input
                  value={shipPhone}
                  onChange={(e) => setShipPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <Button type="button" size="sm" onClick={submitShipBack}>
              Confirm ship back
            </Button>
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t pt-3">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          <X className="mr-2 h-4 w-4" aria-hidden />
          Close
        </Button>
        {onApproveRequest && showApproveRequest ? (
          <Button type="button" onClick={() => onApproveRequest(data.returnId)}>
            {isClaim ? "Approve Claim" : "Approve Request"}
          </Button>
        ) : null}
        {onReject && showReject ? (
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onReject({ returnId: data.returnId, note: note.trim() || undefined })
              onOpenChange(false)
            }}
          >
            <Undo2 className="mr-2 h-4 w-4" aria-hidden />
            Reject
          </Button>
        ) : null}
        {onMarkReceived && showMarkReceived ? (
          <Button type="button" onClick={() => onMarkReceived(data.returnId)}>
            Mark received at warehouse
          </Button>
        ) : null}
        {onQcFail && showQcFail ? (
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onQcFail({ returnId: data.returnId, qcFailureReason: qcFailureReason.trim() || undefined })
              onOpenChange(false)
            }}
          >
            Fail QC
          </Button>
        ) : null}
        {onQcPass && showQcPass ? (
          <Button
            type="button"
            onClick={() => {
              onQcPass({
                returnId: data.returnId,
                note: note.trim() || undefined,
                refundAmount: refundAmount.trim() ? Number(refundAmount) : undefined,
              })
              onOpenChange(false)
            }}
          >
            Pass QC
          </Button>
        ) : null}
        {onConfirmDefective && showConfirmDefective ? (
          <>
            {data.canConfirmDefective !== false ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onConfirmDefective({ returnId: data.returnId, isDefective: true })
                  onOpenChange(false)
                }}
              >
                Confirmed Defective
              </Button>
            ) : null}
            {data.canConfirmNotDefective !== false ? (
              <Button
                type="button"
                onClick={() => {
                  onConfirmDefective({ returnId: data.returnId, isDefective: false })
                  onOpenChange(false)
                }}
              >
                Not Defective — Restock
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  )
}

export function ReturnDetailsModal({
  open,
  onOpenChange,
  data,
  onApproveRequest,
  onAddTracking,
  onMarkReceived,
  onQcPass,
  onQcFail,
  onConfirmDefective,
  onReject,
  onShipBack,
}: ReturnDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden sm:max-w-2xl">
        {data ? (
          <ReturnDetailsModalInner
            key={data.returnId}
            data={data}
            onOpenChange={onOpenChange}
            onApproveRequest={onApproveRequest}
            onAddTracking={onAddTracking}
            onMarkReceived={onMarkReceived}
            onQcPass={onQcPass}
            onQcFail={onQcFail}
            onConfirmDefective={onConfirmDefective}
            onReject={onReject}
            onShipBack={onShipBack}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
