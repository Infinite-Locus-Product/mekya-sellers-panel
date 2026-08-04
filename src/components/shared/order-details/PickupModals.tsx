"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export interface PickupFields {
  courier: string
  contactPerson: string
  phone: string
  estimatedDeliveryAt: string
}

/** "Mark Picked Up" confirmation modal (ready → shipped). Courier, contact person, phone, and
 *  estimated delivery date are all optional fields on PATCH .../status. Shared between the
 *  shipment-card action and the Orders list row action. */
export function MarkPickedUpModal({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (fields: PickupFields) => void
  isSubmitting: boolean
}>) {
  const [courier, setCourier] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [phone, setPhone] = useState("")
  const [estimatedDeliveryAt, setEstimatedDeliveryAt] = useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Mark as picked up</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Courier / freight partner</label>
            <Input
              placeholder="e.g. BlueDart"
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Delivery contact person</label>
            <Input
              placeholder="Full name"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Phone number</label>
            <Input
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Estimated delivery date</label>
            <Input
              type="date"
              value={estimatedDeliveryAt}
              onChange={(e) => setEstimatedDeliveryAt(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting}
            onClick={() => onConfirm({ courier, contactPerson, phone, estimatedDeliveryAt })}
          >
            {isSubmitting ? "Confirming…" : "Confirm pickup"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** "Mark Delivered" confirmation modal (shipped → delivered). Tracking/courier/contact were already
 *  captured at pickup — this just confirms the final handoff, with an optional note. */
export function MarkDeliveredModal({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (fields: { note: string }) => void
  isSubmitting: boolean
}>) {
  const [note, setNote] = useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Mark as delivered</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Notes (optional)</label>
          <textarea
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[60px] w-full resize-none rounded-sm border border-input bg-[#E8E9E8] p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" size="sm" disabled={isSubmitting} onClick={() => onConfirm({ note })}>
            {isSubmitting ? "Confirming…" : "Confirm delivered"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
