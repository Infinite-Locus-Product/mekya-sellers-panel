"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge"
import { OrderDetailPaymentTitleIcon } from "@/assets/icons/order-management"
import type { OrderType } from "@/lib/tableTypes"
import type { PaymentInfo } from "./types"

export function PaymentInformationSection({
  payment,
  formatCurrency,
  orderType,
}: Readonly<{
  payment: PaymentInfo
  formatCurrency: (amount: number) => string
  orderType: OrderType
}>) {
  return (
    <section aria-labelledby="order-detail-payment-heading" className="contents">
      <Card className="bg-[#E8E9E8]/30">
        <CardHeader>
          <CardTitle id="order-detail-payment-heading" className="flex items-center gap-2">
            <OrderDetailPaymentTitleIcon />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="text-foreground">{payment.method}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Status</span>
            <PaymentStatusBadge variant={payment.status}>{payment.status}</PaymentStatusBadge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatCurrency(payment.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST 18%</span>
              <span className="text-foreground">{formatCurrency(payment.gst)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping charges</span>
              <span className="text-foreground">
                {payment.shippingCharges === 0 ? "Free" : formatCurrency(payment.shippingCharges)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">Total amount</span>
              <span className="text-foreground">{formatCurrency(payment.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
