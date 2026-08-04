"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createRtoRecord } from "@/lib/api/orders"

/** Records a post-delivery return-to-origin for an order already shipped/delivered/in transit. No
 * Saleor mutation — the order stays FULFILLED; the row then appears on the Cancellation tab where
 * "Mark Item Received" (rtoReceiveShipment) is used once the parcel physically arrives back. */
export function CreateRtoAction({
  orderId,
  onDone,
}: Readonly<{ orderId: string; onDone?: () => void }>) {
  const [open, setOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const confirm = async () => {
    if (!trackingNumber.trim()) {
      toast.error("Tracking number required")
      return
    }
    setIsSubmitting(true)
    try {
      await createRtoRecord(orderId, {
        tracking_number: trackingNumber.trim(),
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      })
      toast.success(`${orderId} marked as RTO — added to the Cancellation tab`)
      setOpen(false)
      onDone?.()
    } catch (err) {
      toast.error("Could not create RTO record", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Create RTO record</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Tracking number (required)</label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Reason (optional — defaults to &quot;Customer unavailable at delivery&quot;)
              </label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} className="h-9 text-sm" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Go back
            </Button>
            <Button type="button" size="sm" disabled={isSubmitting} onClick={confirm}>
              {isSubmitting ? "Confirming…" : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setOpen(true)}>
        Create RTO record
      </Button>
    </>
  )
}
