import { Suspense } from "react"
import { OrderDetailClient } from "./OrderDetailClient"

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>
}

export default async function OrderDetailsPage({ params }: Readonly<OrderDetailPageProps>) {
  const { orderId } = await params
  return (
    <Suspense fallback={null}>
      <OrderDetailClient orderId={orderId} />
    </Suspense>
  )
}
