"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cancelShipment } from "@/lib/api/orders"

/** Cancels a single pre-dispatch shipment via Saleor orderFulfillmentCancel — restocks inventory.
 * Only valid for pending/order_placed/processing/ready_for_dispatch/ready fulfillments. */
export function CancelShipmentAction({
  orderId,
  fulfillmentId,
  onDone,
}: Readonly<{ orderId: string; fulfillmentId: string; onDone?: () => void }>) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const confirm = async () => {
    if (!reason.trim()) {
      toast.error("Reason required")
      return
    }
    setIsSubmitting(true)
    try {
      await cancelShipment(orderId, fulfillmentId, reason.trim())
      toast.success("Shipment cancelled — inventory restocked")
      setOpen(false)
      onDone?.()
    } catch (err) {
      toast.error("Could not cancel shipment", {
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
            <DialogTitle className="text-base font-semibold">Cancel shipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Reason (required)</label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Go back
            </Button>
            <Button type="button" variant="destructive" size="sm" disabled={isSubmitting} onClick={confirm}>
              {isSubmitting ? "Cancelling…" : "Confirm cancellation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 text-xs text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        Cancel shipment
      </Button>
    </>
  )
}
