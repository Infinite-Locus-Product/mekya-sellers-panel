import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getOrderDetails } from "@/lib/data/orders"
import { OrderDetailClient } from "./OrderDetailClient"

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>
}

export default async function OrderDetailsPage({ params }: Readonly<OrderDetailPageProps>) {
  const { orderId } = await params
  const order = await getOrderDetails(orderId)
  if (!order) notFound()
  return (
    <Suspense fallback={null}>
      <OrderDetailClient order={order} />
    </Suspense>
  )
}
