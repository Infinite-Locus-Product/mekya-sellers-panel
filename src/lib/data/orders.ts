/**
 * Orders data layer. API-ready: replace mock implementation with fetch when backend is integrated.
 */

import { mockOrders } from "../orderData";
import type { AllOrder } from "@/lib/tableTypes";

/**
 * Fetch all orders. Replace body with: const res = await fetch('/api/orders'); return res.json();
 */
export async function getOrders(): Promise<AllOrder[]> {
  return mockOrders;
}
