"use client"

import { useEffect, useRef, useState } from "react"
import { notFound } from "next/navigation"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { OrderDetails } from "@/components/shared"
import { Breadcrumb } from "@/components/shared/Breadcrumb"
import type { OrderDetailsData } from "@/components/shared/OrderDetails"
import { getOrderDetail, getOrderInvoice } from "@/lib/api/orders"
import { getOrderDetails as getMockOrderDetails } from "@/lib/data/orders"
import { mapApiOrderDetailToOrderDetailsData } from "./mapOrderDetail"

export interface OrderDetailClientProps {
  orderId: string
}

export function OrderDetailClient({ orderId }: Readonly<OrderDetailClientProps>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<OrderDetailsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFoundFlag, setNotFoundFlag] = useState(false)
  const [refetchToken, setRefetchToken] = useState(0)
  const isInitialLoadRef = useRef(true)

  useEffect(() => {
    let cancelled = false
    if (isInitialLoadRef.current) {
      queueMicrotask(() => {
        if (!cancelled) setLoading(true)
      })
    }
    getOrderDetail(orderId)
      .then((detail) => mapApiOrderDetailToOrderDetailsData(detail))
      .catch(() => getMockOrderDetails(orderId))
      .then((resolved) => {
        if (cancelled) return
        if (!resolved) {
          setNotFoundFlag(true)
          return
        }
        setOrder(resolved)
        isInitialLoadRef.current = false
      })
      .catch(() => {
        if (!cancelled) setNotFoundFlag(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [orderId, refetchToken])

  const handleRefresh = () => setRefetchToken((t) => t + 1)

  // notFound() must be called synchronously during render (not in an effect/promise callback)
  // for Next's error boundary to intercept it.
  if (notFoundFlag) notFound()

  useEffect(() => {
    if (!order) return
    const expected = order.orderType === "B2B" ? "b2b" : "b2c"
    if (searchParams.get("segment") === expected) return
    const next = new URLSearchParams(searchParams.toString())
    next.set("segment", expected)
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }, [order, pathname, router, searchParams])

  const handleExportPDF = (id: string) => {
    getOrderInvoice(id)
      .then((html) => {
        const win = window.open("", "_blank")
        if (!win) return
        win.document.open()
        win.document.write(html)
        win.document.close()
      })
      .catch((err: unknown) =>
        toast.error("Failed to generate invoice", {
          description: err instanceof Error ? err.message : "Please try again.",
        }),
      )
  }
  const handleSendUpdate = (id: string) => {
    void id
  }

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
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
        key={order.id}
        order={order}
        onExportPDF={handleExportPDF}
        onSendUpdate={handleSendUpdate}
        onRefresh={handleRefresh}
      />
    </div>
  )
}
