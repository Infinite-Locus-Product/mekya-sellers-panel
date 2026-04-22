"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderDetailOrderItemsTitleIcon } from "@/assets/icons/order-management"
import type { OrderType } from "@/lib/tableTypes"
import type { B2BFulfillmentStats, B2BOrderLineDisplay, OrderItem } from "./types"
import { B2BOrderLinesSection } from "./B2BOrderLinesSection"

export function OrderItemSection({
  orderType,
  items,
  b2bLineItems,
  b2bFulfillmentStats,
  formatCurrency,
}: Readonly<{
  orderType: OrderType
  items: OrderItem[]
  b2bLineItems?: B2BOrderLineDisplay[]
  b2bFulfillmentStats?: B2BFulfillmentStats
  formatCurrency: (amount: number) => string
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
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Price</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.sku} className="border-b">
                    <td className="p-3 text-sm text-foreground">{item.product}</td>
                    <td className="p-3 text-sm text-muted-foreground">{item.sku}</td>
                    <td className="p-3 text-sm text-muted-foreground">{item.quantity}</td>
                    <td className="p-3 text-sm text-muted-foreground">{formatCurrency(item.price)}</td>
                    <td className="p-3 text-sm text-foreground text-right">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
                <tr className="border-t-2">
                  <td colSpan={4} className="p-3 text-sm font-semibold text-foreground text-right bg-[#E8E9E8]">
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
