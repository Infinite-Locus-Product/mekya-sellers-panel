"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  OrderDetailCustomerAddressIcon,
  OrderDetailCustomerEmailIcon,
  OrderDetailCustomerPhoneIcon,
  OrderDetailCustomerTitleIcon,
} from "@/assets/icons/order-management"
import type { OrderType } from "@/lib/tableTypes"
import type { CustomerInfo } from "./types"

export function CustomerInformationSection({
  customer,
  orderType,
}: Readonly<{
  customer: CustomerInfo
  orderType: OrderType
}>) {
  const footerHint =
    orderType === "B2B"
      ? "Business buyer — pricing and terms follow your B2B agreement."
      : "Direct customer — standard retail checkout and policies apply."

  return (
    <section aria-labelledby="order-detail-customer-heading" className="contents">
      <Card className="bg-[#E8E9E8]/30">
        <CardHeader>
          <CardTitle id="order-detail-customer-heading" className="flex items-center gap-2">
            <OrderDetailCustomerTitleIcon />
            Customer Information
          </CardTitle>
          <p className="text-xs text-muted-foreground">{footerHint}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-base font-semibold text-foreground">{customer.name}</p>
            {customer.company ? <p className="text-sm text-muted-foreground mt-1">{customer.company}</p> : null}
            {customer.tag ? (
              <span className="inline-block px-3 py-1 text-xs font-medium bg-black text-white rounded-full  mt-2">
                {customer.tag}
              </span>
            ) : null}
          </div>
          <div className="w-full h-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <OrderDetailCustomerEmailIcon />
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <OrderDetailCustomerPhoneIcon />
            <p className="text-sm text-muted-foreground">{customer.phone}</p>
          </div>
          <div className="flex items-start gap-2">
            <OrderDetailCustomerAddressIcon className="mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">{customer.address}</p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
