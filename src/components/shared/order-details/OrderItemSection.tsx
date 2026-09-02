"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderDetailOrderItemsTitleIcon } from "@/assets/icons/order-management"
import type { OrderType } from "@/lib/tableTypes"
import type { B2BFulfillmentStats, B2BOrderLineDisplay, OrderItem } from "./types"
import { B2BOrderLinesSection } from "./B2BOrderLinesSection"
import { CancelLineItemAction } from "./CancelLineItemAction"

/** Cancelled and still-unaddressed units have to be visually distinct from ones that moved,
 *  otherwise the column reads as "all fine" at a glance. Matched on the label because the
 *  shipment states come through as their display step, not a code. */
function itemStatusClass(label: string): string {
  const l = label.toLowerCase()
  if (l === "cancelled" || l === "canceled") return "bg-red-100 text-red-800"
  if (l === "returned") return "bg-orange-100 text-orange-800"
  if (l === "delivered") return "bg-green-100 text-green-800"
  if (l === "pending") return "bg-amber-100 text-amber-800"
  return "bg-slate-100 text-slate-700"
}

export function OrderItemSection({
  orderType,
  items,
  b2bLineItems,
  b2bFulfillmentStats,
  formatCurrency,
  orderId,
  onRefresh,
}: Readonly<{
  orderType: OrderType
  items: OrderItem[]
  b2bLineItems?: B2BOrderLineDisplay[]
  b2bFulfillmentStats?: B2BFulfillmentStats
  formatCurrency: (amount: number) => string
  /** Display order ID (ORD-…) — needed to cancel a line. Omit to hide cancel actions. */
  orderId?: string
  onRefresh?: () => void
}>) {
  if (orderType === "B2B" && b2bLineItems?.length) {
    return (
      <section aria-labelledby="order-detail-items-heading" className="contents">
        <B2BOrderLinesSection
          lines={b2bLineItems}
          formatCurrency={formatCurrency}
          fulfillmentSummary={b2bFulfillmentStats}
        />
      </section>
    )
  }

  // Cancel is only offered when the caller supplied an order id (and therefore a refresh
  // path) and at least one line still has cancellable units.
  const showActions = Boolean(orderId) && items.some((i) => (i.cancellableQuantity ?? 0) > 0)

  return (
    <section aria-labelledby="order-detail-items-heading" className="contents">
      <Card className="bg-[#E8E9E8]/30">
        <CardHeader>
          <CardTitle id="order-detail-items-heading" className="flex items-center gap-2">
            <OrderDetailOrderItemsTitleIcon />
            Order Item
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            B2C line items — simple product list and totals (no wholesale bundles).
          </p>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">{items.length} item(s) in this order</p>
          <div className="w-full h-px bg-gray-300 mb-4"></div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-[#E8E9E8]">
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Product</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">SKU</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Quantity</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Price</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">Total</th>
                  {showActions ? (
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground">Action</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const cancellableQty = item.cancellableQuantity ?? 0
                  const statuses = item.statuses ?? []
                  // Neither shipped nor cancelled — e.g. a packed parcel for this line was
                  // voided and only part of it was subsequently cancelled, so a remainder is
                  // still sitting unaddressed. Unlike the cancelled count, nothing else on this
                  // page hints at this, so it's called out here rather than left invisible.
                  const pendingQty = item.pendingQuantity ?? 0
                  const hasStrayPending = pendingQty > 0 && pendingQty < item.quantity
                  return (
                  <tr key={item.orderLineId ?? item.sku} className="border-b">
                    <td className="p-3 text-sm text-foreground">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="size-10 shrink-0 rounded-md border border-border object-cover"
                          />
                        ) : (
                          <div className="size-10 shrink-0 rounded-md border border-border bg-muted" aria-hidden />
                        )}
                        <span>{item.product}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{item.sku}</td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {item.quantity}
                      {hasStrayPending ? (
                        <span className="ml-1.5 whitespace-nowrap rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                          ({pendingQty} needs action)
                        </span>
                      ) : null}
                    </td>
                    {/* Where the units actually are. The order badge alone was not enough: a
                        "Partially Cancelled" order listed three items with no state on any of
                        them, so the cancelled unit was indistinguishable from the delivered
                        ones. Counts are shown only when the line is split, since "1 Delivered"
                        on a single-unit line is just noise. */}
                    <td className="p-3 text-sm">
                      {statuses.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {statuses.map((s) => (
                            <span
                              key={s.label}
                              className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${itemStatusClass(s.label)}`}
                            >
                              {statuses.length > 1 || s.quantity !== item.quantity
                                ? `${s.quantity} ${s.label}`
                                : s.label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{formatCurrency(item.price)}</td>
                    <td className="p-3 text-sm text-foreground text-right">{formatCurrency(item.total)}</td>
                    {showActions ? (
                      <td className="p-3 text-right">
                        {item.orderLineId && cancellableQty > 0 ? (
                          <CancelLineItemAction
                            orderId={orderId as string}
                            orderLineId={item.orderLineId}
                            productName={item.product}
                            quantity={cancellableQty}
                            onDone={onRefresh}
                          />
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}
                      </td>
                    ) : null}
                  </tr>
                  )
                })}
                <tr className="border-t-2">
                  <td
                    colSpan={showActions ? 6 : 5}
                    className="p-3 text-sm font-semibold text-foreground text-right bg-[#E8E9E8]"
                  >
                    TOTAL
                  </td>
                  <td className="p-3 text-sm font-semibold text-foreground text-right bg-[#E8E9E8]">
                    {formatCurrency(items.reduce((sum, item) => sum + item.total, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
