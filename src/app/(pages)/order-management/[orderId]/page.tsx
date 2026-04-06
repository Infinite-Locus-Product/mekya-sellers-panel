import { notFound } from "next/navigation";
import { getOrderDetails } from "@/lib/data";
import { OrderDetailClient } from "./OrderDetailClient";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailsPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const order = await getOrderDetails(orderId);
  if (!order) notFound();
  return <OrderDetailClient order={order} />;
}
