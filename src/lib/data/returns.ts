/**
 * Returns data layer. API-ready: replace with fetch when backend is integrated.
 */

import type { ReturnDetailsData } from "@/app/(pages)/order-management/returns/_components/modals";

export interface ReturnItem {
  returnId: string;
  orderId: string;
  vendor: string;
  requestDate: string;
  refundAmount: string;
  orderStatus: "in process" | "return initiated" | "rejected" | "completed";
  requestType: "return" | "exchange";
}

const mockReturns: ReturnItem[] = [
  { returnId: "RET-2024-001", orderId: "ORD-2024-001", vendor: "Rajesh Kumar", requestDate: "14 Jun 2025, 10:30 am", refundAmount: "₹2,499", orderStatus: "in process", requestType: "return" },
  { returnId: "RET-2024-002", orderId: "ORD-2024-002", vendor: "ABC Retailers Pvt Ltd", requestDate: "14 Jun 2025, 11:00 am", refundAmount: "₹5,999", orderStatus: "return initiated", requestType: "exchange" },
  { returnId: "RET-2024-003", orderId: "ORD-2024-003", vendor: "XYZ Store", requestDate: "14 Jun 2025, 11:30 am", refundAmount: "₹1,299", orderStatus: "rejected", requestType: "return" },
  { returnId: "RET-2024-004", orderId: "ORD-2024-004", vendor: "Test Vendor", requestDate: "14 Jun 2025, 12:00 pm", refundAmount: "₹3,499", orderStatus: "completed", requestType: "exchange" },
  { returnId: "RET-2024-005", orderId: "ORD-2024-005", vendor: "Sample Store", requestDate: "14 Jun 2025, 12:30 pm", refundAmount: "₹899", orderStatus: "in process", requestType: "return" },
  { returnId: "RET-2024-006", orderId: "ORD-2024-006", vendor: "Demo Vendor", requestDate: "14 Jun 2025, 1:00 pm", refundAmount: "₹4,999", orderStatus: "return initiated", requestType: "exchange" },
];

const mockReasons: Record<string, string> = {
  "RET-2024-001": "Product defective - Clothes are torn and the fabric has been ripped.",
  "RET-2024-002": "Wrong size received. Customer requested exchange.",
  "RET-2024-003": "Item damaged in transit.",
  "RET-2024-004": "Customer changed mind.",
  "RET-2024-005": "Quality issue - color fade.",
  "RET-2024-006": "Defective stitching.",
};

export async function getReturns(): Promise<ReturnItem[]> {
  return Promise.resolve(mockReturns);
}

export async function getReturnDetails(returnId: string): Promise<ReturnDetailsData | null> {
  const row = mockReturns.find((r) => r.returnId === returnId);
  if (!row) return null;
  const items: ReturnDetailsData["items"] =
    row.returnId === "RET-2024-001"
      ? [
          { product: "Premium Kurta", sku: "PW-001", quantity: 3, price: "₹2,499", total: "₹2,499" },
          { product: "Cotton T-Shirt", sku: "PW-002", quantity: 9, price: "₹3,547.36", total: "₹31,926.24" },
        ]
      : [{ product: "Sample Product", sku: "SKU-001", quantity: 1, price: row.refundAmount, total: row.refundAmount }];
  return {
    returnId: row.returnId,
    orderId: row.orderId,
    vendor: row.vendor,
    requestDate: row.requestDate.split(",")[0] ?? row.requestDate,
    refundAmount: row.refundAmount,
    requestType: row.requestType,
    reasonForReturn: mockReasons[row.returnId] ?? "No reason provided.",
    items,
  };
}
