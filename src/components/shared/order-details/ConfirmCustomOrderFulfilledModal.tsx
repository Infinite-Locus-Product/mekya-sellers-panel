"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import type { OrderCustomOrderLink } from "./types"

/**
 * Gate in front of creating a shipment for an order that came from a custom-order request.
 *
 * These orders represent bespoke work (custom colours, embroidery, batch sizing) that the
 * seller physically has to produce before anything can ship — unlike an ordinary order,
 * where the goods already exist. So fulfilment asks for an explicit "yes, it's made"
 * rather than shipping on a single click.
 *
 * Purely a confirmation: declining closes the dialog and changes nothing, so a seller who
 * clicked by mistake can never leave the order in a half-fulfilled state.
 */
export function ConfirmCustomOrderFulfilledModal({
  open,
  onOpenChange,
  customOrder,
  itemCount,
  onViewCustomOrder,
  onConfirm,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  customOrder: OrderCustomOrderLink
  /** How many lines the seller selected, so the dialog says what it is about to ship. */
  itemCount: number
  onViewCustomOrder: () => void
  onConfirm: () => void
}>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {/* pr-12 clears DialogContent's absolutely positioned close button. */}
        <DialogHeader className="pr-12">
          <DialogTitle className="text-base font-semibold">
            Is this custom order fulfilled?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This order came from a custom request. Confirm the requested items have actually
            been produced to specification before shipping{" "}
            <span className="font-medium text-foreground">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </span>
            .
          </p>

          <button
            type="button"
            onClick={onViewCustomOrder}
            className="flex w-full items-start gap-2 rounded-md border border-border bg-muted/30 p-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">
                View custom order request
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {customOrder.contactPerson ?? customOrder.customerEmail ?? "Custom request"}
                {" · "}
                {customOrder.customStatus.replaceAll("_", " ")}
              </span>
            </span>
          </button>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Not yet
          </Button>
          <Button type="button" size="sm" onClick={onConfirm}>
            Yes, continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
