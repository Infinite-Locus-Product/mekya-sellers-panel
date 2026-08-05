"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { updateShipmentStatus } from "@/lib/api/orders"
import type { ShipmentStepperStep } from "./types"
import { MarkPickedUpModal, MarkDeliveredModal } from "./PickupModals"
import { CancelShipmentAction } from "./CancelShipmentAction"
import { findCurrentStepKey } from "./utils"

/**
 * One contextual action button per shipment stage — no dropdown, no stepper. Pending / order
 * placed / processing / ready for dispatch → "Pack and label" (single click, no modal; PATCHes
 * straight to "ready"), plus a secondary "Cancel shipment". Ready → "Mark picked up" (modal), plus
 * "Cancel shipment". Shipped / in transit → "Mark delivered" (modal). Delivered is terminal — no
 * action. RTO-received (once a cancelled parcel is physically back) lives on the Cancellation tab,
 * not here.
 */
export function ShipmentActions({
  orderId,
  fulfillmentId,
  currentStep,
  steps,
  onDone,
}: Readonly<{
  orderId: string
  fulfillmentId: string
  currentStep: string
  steps: ShipmentStepperStep[]
  onDone?: () => void
}>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pickupModalOpen, setPickupModalOpen] = useState(false)
  const [deliveredModalOpen, setDeliveredModalOpen] = useState(false)

  const statusKey = findCurrentStepKey(currentStep, steps)

  const confirmPickup = async ({
    courier,
    contactPerson,
    phone,
    estimatedDeliveryAt,
  }: {
    courier: string
    contactPerson: string
    phone: string
    estimatedDeliveryAt: string
  }) => {
    setIsSubmitting(true)
    try {
      await updateShipmentStatus(orderId, fulfillmentId, {
        status: "shipped",
        ...(courier.trim() ? { courier: courier.trim() } : {}),
        ...(contactPerson.trim() ? { contact_person: contactPerson.trim() } : {}),
        ...(phone.trim() ? { contact_phone: phone.trim() } : {}),
        ...(estimatedDeliveryAt ? { estimated_delivery_at: estimatedDeliveryAt } : {}),
      })
      toast.success("Marked as picked up — shipment is now Shipped")
      setPickupModalOpen(false)
      onDone?.()
    } catch (err) {
      toast.error("Update failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelivered = async ({ note }: { note: string }) => {
    setIsSubmitting(true)
    try {
      await updateShipmentStatus(orderId, fulfillmentId, {
        status: "delivered",
        ...(note.trim() ? { note: note.trim() } : {}),
      })
      toast.success("Marked as delivered")
      setDeliveredModalOpen(false)
      onDone?.()
    } catch (err) {
      toast.error("Update failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const packAndLabel = async () => {
    setIsSubmitting(true)
    try {
      await updateShipmentStatus(orderId, fulfillmentId, { status: "ready" })
      toast.success("Packed and labeled — ready for pickup")
      onDone?.()
    } catch (err) {
      toast.error("Update failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (
    statusKey === "pending" ||
    statusKey === "order_placed" ||
    statusKey === "processing" ||
    statusKey === "ready_for_dispatch"
  ) {
    return (
      <>
        <Button type="button" size="sm" disabled={isSubmitting} onClick={packAndLabel} className="h-7 text-xs">
          {isSubmitting ? "Packing…" : "Pack and label"}
        </Button>
        <CancelShipmentAction orderId={orderId} fulfillmentId={fulfillmentId} onDone={onDone} />
      </>
    )
  }

  if (statusKey === "ready") {
    return (
      <>
        <MarkPickedUpModal
          open={pickupModalOpen}
          onOpenChange={setPickupModalOpen}
          onConfirm={confirmPickup}
          isSubmitting={isSubmitting}
        />
        <Button type="button" size="sm" onClick={() => setPickupModalOpen(true)} className="h-7 text-xs">
          Mark picked up
        </Button>
        <CancelShipmentAction orderId={orderId} fulfillmentId={fulfillmentId} onDone={onDone} />
      </>
    )
  }

  if (statusKey === "shipped" || statusKey === "in_transit") {
    return (
      <>
        <MarkDeliveredModal
          open={deliveredModalOpen}
          onOpenChange={setDeliveredModalOpen}
          onConfirm={confirmDelivered}
          isSubmitting={isSubmitting}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setDeliveredModalOpen(true)}
          className="h-7 text-xs"
        >
          Mark delivered
        </Button>
      </>
    )
  }

  return null
}
