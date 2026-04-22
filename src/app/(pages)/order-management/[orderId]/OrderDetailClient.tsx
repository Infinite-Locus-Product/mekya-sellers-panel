"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { OrderDetails } from "@/components/shared"
import { Breadcrumb } from "@/components/shared/Breadcrumb"
import type { OrderDetailsData } from "@/components/shared/OrderDetails"
import type { StatusVariant } from "@/components/shared/StatusBadge"

export interface OrderDetailClientProps {
  order: OrderDetailsData
}

export function OrderDetailClient({ order }: Readonly<OrderDetailClientProps>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const expected = order.orderType === "B2B" ? "b2b" : "b2c"
    if (searchParams.get("segment") === expected) return
    const next = new URLSearchParams(searchParams.toString())
    next.set("segment", expected)
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }, [order.orderType, pathname, router, searchParams])

  const handleStatusUpdate = (_orderId: string, _status: StatusVariant, _notes: string) => {
  }
  const handleExportPDF = (_orderId: string) => {
  }
  const handleSendUpdate = (_orderId: string) => {
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Seller Dashboard", href: "/" },
          {
            label: "Order Management",
            href: order.orderType === "B2B" ? "/order-management/b2b" : "/order-management/b2c",
          },
          { label: order.id },
        ]}
      />
      <OrderDetails
        order={order}
        onStatusUpdate={handleStatusUpdate}
        onExportPDF={handleExportPDF}
        onSendUpdate={handleSendUpdate}
      />
    </div>
  )
}
