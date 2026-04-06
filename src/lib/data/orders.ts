/**
 * Orders data layer. API-ready: replace mock implementation with fetch when backend is integrated.
 */

import { mockOrders, getOrderDetails as getOrderDetailsMock } from "@/lib/orderData";
import type { AllOrder } from "@/lib/tableTypes";
import type { OrderDetailsData } from "@/components/shared/OrderDetails";

/**
 * Fetch all orders. Replace body with: const res = await fetch('/api/orders'); return res.json();
 */
export async function getOrders(): Promise<AllOrder[]> {
  return Promise.resolve(mockOrders);
}

/**
 * Fetch order details by id. Replace body with: const res = await fetch(`/api/orders/${id}`); return res.json();
 */
export async function getOrderDetails(orderId: string): Promise<OrderDetailsData | null> {
  return Promise.resolve(getOrderDetailsMock(orderId));
}
