"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatCurrencyINR } from "@/lib/utils"
import {
  getCustomOrderRequestDetail,
  type ApiCustomOrderRequestDetail,
  type CustomOrderRequestStatus,
} from "@/lib/api/orders"

const STATUS_LABEL: Record<CustomOrderRequestStatus, string> = {
  pending_review: "Pending Review",
  awaiting_buyer_confirmation: "Awaiting Buyer Confirmation",
  buyer_confirmed: "Buyer Confirmed",
  buyer_declined: "Declined by Buyer",
  rejected: "Rejected by Seller",
}

/**
 * The originating custom request, opened from an order's fulfilment confirmation.
 *
 * Deliberately read-only — no approve / reject / buyer-confirm / notes. By the time an
 * order exists the request is already buyer_confirmed, so those actions are either no-ops
 * or would contradict an order that has been placed. This is reference material for the
 * seller deciding whether the work is done, not a second place to drive the workflow.
 */
export function CustomOrderRequestReadOnlyModal({
  customOrderId,
  onOpenChange,
}: Readonly<{
  /** Null closes the dialog; an id opens it and triggers the fetch. */
  customOrderId: string | null
  onOpenChange: (open: boolean) => void
}>) {
  const [data, setData] = useState<ApiCustomOrderRequestDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!customOrderId) return
    let cancelled = false
    // Deferred to a microtask so resetting to the loading state doesn't run synchronously
    // inside the effect body and cascade a re-render.
    queueMicrotask(() => {
      if (cancelled) return
      setLoading(true)
      setError(false)
      setData(null)
    })
    getCustomOrderRequestDetail(customOrderId)
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [customOrderId])

  const money = (amount: string | number | null | undefined) =>
    amount == null ? "—" : formatCurrencyINR(Number(amount))

  return (
    <Dialog open={customOrderId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        {/* pr-12 keeps the title and badge clear of DialogContent's own absolutely
            positioned close button at right-2/top-2, which they otherwise run underneath. */}
        <DialogHeader className="pr-12">
          <DialogTitle className="flex flex-wrap items-center gap-2 text-base font-semibold">
            <span className="whitespace-nowrap">Custom Order Request</span>
            {data ? (
              <StatusBadge
                // StatusBadge defaults to w-full for fixed-width table cells; here it must
                // hug its text instead of stretching across the header.
                className="w-auto shrink-0 px-3"
                variant={data.custom_status === "buyer_confirmed" ? "delivered" : "pending"}
              >
                {STATUS_LABEL[data.custom_status] ?? data.custom_status}
              </StatusBadge>
            ) : null}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Loading request…
          </div>
        ) : error || !data ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Couldn&apos;t load this custom order request.
          </p>
        ) : (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Contact</dt>
              <dd className="text-foreground">{data.contact_person ?? "—"}</dd>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate text-foreground">{data.customer_email ?? "—"}</dd>
              <dt className="text-muted-foreground">Total</dt>
              <dd className="text-foreground">{money(data.total_amount)}</dd>
            </dl>

            {data.requirements_text ? (
              <section>
                <h3 className="mb-1 text-xs font-medium text-muted-foreground">Requirements</h3>
                <p className="whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-3 text-sm text-foreground">
                  {data.requirements_text}
                </p>
              </section>
            ) : null}

            {data.packaging_notes ? (
              <section>
                <h3 className="mb-1 text-xs font-medium text-muted-foreground">Packaging</h3>
                <p className="whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-3 text-sm text-foreground">
                  {data.packaging_notes}
                </p>
              </section>
            ) : null}

            {data.order_lines.length > 0 ? (
              <section>
                <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Requested items
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="py-1 pr-3 font-medium">Product</th>
                        <th className="py-1 pr-3 font-medium">SKU</th>
                        <th className="py-1 pr-3 text-right font-medium">Qty</th>
                        <th className="py-1 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.order_lines.map((line) => (
                        <tr key={line.line_id} className="border-b border-border/50 last:border-0">
                          <td className="py-1.5 pr-3 text-foreground">
                            {line.product_name}
                            {line.variant_name ? (
                              <span className="text-muted-foreground"> · {line.variant_name}</span>
                            ) : null}
                          </td>
                          <td className="py-1.5 pr-3 text-muted-foreground">{line.sku ?? "—"}</td>
                          <td className="py-1.5 pr-3 text-right text-foreground">{line.quantity}</td>
                          <td className="py-1.5 text-right text-foreground">
                            {money(line.total_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            {data.notes.length > 0 ? (
              <section>
                <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">Notes</h3>
                <ul className="space-y-2">
                  {data.notes.map((note) => (
                    <li key={note.id} className="rounded-md border border-border p-2 text-xs">
                      <p className="text-foreground">{note.body}</p>
                      <p className="mt-0.5 text-muted-foreground">{note.author}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
