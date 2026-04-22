/**
 * Orders data layer. API-ready: replace mock implementation with fetch when backend is integrated.
 */

import { mockOrders } from "../orderData";
import type { AllOrder } from "@/lib/tableTypes";
import type {
  OrderDetailsData,
  FulfillmentTimelineItem,
  OrderItem,
  B2BOrderLineDisplay,
  B2BConfigurationDisplay,
  B2BFulfillmentStats,
} from "@/components/shared/order-details/types";
import type { StatusVariant } from "@/components/shared/StatusBadge";

const ORDER_STATUS_MAP: Record<string, StatusVariant> = {
  completed: "delivered",
  delivered: "delivered",
  pending: "pending",
  processing: "processing",
  shipped: "shipped",
  canceled: "canceled",
  cancelled: "canceled",
  returned: "returned",
  "partial fulfillment": "partial",
};

function normalizeStatusKey(value: string): string {
  return value.toLowerCase().replaceAll(/\s+/g, " ").trim();
}

const TIMELINE_STAGES: Array<{ stage: string; status: StatusVariant }> = [
  { stage: "Order Placed", status: "pending" },
  { stage: "Order Processing", status: "processing" },
  { stage: "Ready for Dispatch", status: "processing" },
  { stage: "Shipped", status: "shipped" },
  { stage: "In Transit", status: "shipped" },
  { stage: "Delivered", status: "delivered" },
];

function parseAmount(value: string): number {
  const numeric = Number(value.replaceAll(/[^\d.]/g, ""));
  return Number.isNaN(numeric) ? 0 : numeric;
}

function normalizeStatus(value: string): StatusVariant {
  const key = normalizeStatusKey(value);
  return ORDER_STATUS_MAP[key] ?? "pending";
}

function buildTimeline(
  status: StatusVariant,
  date: string,
): FulfillmentTimelineItem[] {
  const currentIndex = TIMELINE_STAGES.findIndex(
    (entry) => entry.status === status,
  );
  const fallbackIndex = status === "canceled" || status === "returned" ? 1 : 0;
  const activeIndex = currentIndex >= 0 ? currentIndex : fallbackIndex;

  return TIMELINE_STAGES.map((entry, index) => ({
    stage: entry.stage,
    date,
    time: index === 0 ? "10:30 AM" : "11:00 AM",
    completed: index < activeIndex,
    current: index === activeIndex,
  }));
}

function buildItems(order: AllOrder, amount: number): OrderItem[] {
  return [
    {
      product: `${order.type} Order Item`,
      sku: `${order.id}-SKU-01`,
      quantity: 1,
      price: amount,
      total: amount,
    },
  ];
}

const B2B_IMAGE_MAIN = "/images/cms1.jpg";
const B2B_IMAGE_THUMBS = [
  "/images/cms2.jpg",
  "/images/cms3.jpg",
  "/images/cms4.jpg",
  "/images/cms5.jpg",
] as const;

/**
 * Builds B2B order line UI model (sets/bundles). Uses `productList` when present; otherwise demo defaults.
 * Side effects: none. Failure modes: none (synthetic data only).
 */
function buildB2BLineDisplay(order: AllOrder): B2BOrderLineDisplay {
  const list = order.productList ?? [];
  const numericId = order.id.replaceAll(/\D/g, "").slice(-3).padStart(3, "0") || "001";

  const first = list[0];
  const second = list[1];
  const productName =
    first?.name ?? "Men's Ultra-Soft Combed Cotton White T-Shirt";

  const setsA = first?.quantity ?? 10;
  const setsB = second?.quantity ?? 10;
  const wspA = first?.price ?? 2000;
  const wspB = second?.price ?? 2000;

  const lineTotalA = setsA * wspA;
  const lineTotalB = setsB * wspB;
  const totalSets = setsA + setsB;
  const lineTotalAmount = lineTotalA + lineTotalB;

  const configATitle = "Black Size Trio";
  const configBTitle = second?.name ? second.name.slice(0, 36) : "Colored Size Pick 6";

  const configAIncluded: B2BConfigurationDisplay["includedLines"] = [
    { label: "S - Black" },
    { label: "M - Black" },
    { label: "L - Black" },
  ];

  const configBIncluded: B2BConfigurationDisplay["includedLines"] = [
    { label: "L - Blue" },
    { label: "L - Orange" },
    { label: "L - Yellow" },
    { label: "L - Black" },
    { label: "L - Red" },
    { label: "L - Green" },
  ];

  const configurations: B2BConfigurationDisplay[] = [
    {
      id: `${order.id}-set-a`,
      title: configATitle,
      itemsPerSet: 3,
      bundleKind: "set_purchase",
      sizeLabels: ["S", "M", "L"],
      colorLabel: "Black",
      colorSwatches: ["#171717"],
      setsOrdered: setsA,
      lineTotal: lineTotalA,
      includedLines: configAIncluded,
    },
    {
      id: `${order.id}-set-b`,
      title: configBTitle,
      itemsPerSet: 6,
      bundleKind: "single_size_bundle",
      sizeLabels: ["L"],
      colorLabel: "",
      colorSwatches: ["#2563EB", "#EA580C", "#EAB308", "#171717", "#DC2626", "#16A34A"],
      setsOrdered: setsB,
      lineTotal: lineTotalB,
      includedLines: configBIncluded,
    },
  ];

  return {
    productName,
    articleNumber: `LUX-CS-2025-${numericId}`,
    sku: `PW-${numericId}`,
    wholesalePricePerSet: wspA,
    mainImageSrc: B2B_IMAGE_MAIN,
    thumbnailSrcs: B2B_IMAGE_THUMBS,
    configurations,
    totalSets,
    lineTotalAmount,
  };
}

/** B2B partial-fulfillment detail demo: size grid + totals (replace with API fields when integrated). */
function buildB2BPartialFulfillmentLine(order: AllOrder): B2BOrderLineDisplay {
  const numericId = order.id.replaceAll(/\D/g, "").slice(-3).padStart(3, "0") || "001"

  return {
    productName: "Men's Zip Up Sporty Jacket & Tied Pants Set",
    articleNumber: `LUX-CS-2025-${numericId}`,
    sku: `PW-${numericId}`,
    wholesalePricePerSet: 500,
    wholesalePriceUnitLabel: "per item",
    mainImageSrc: B2B_IMAGE_MAIN,
    thumbnailSrcs: B2B_IMAGE_THUMBS,
    configurations: [],
    totalSets: 45,
    lineTotalAmount: 23_000,
    isCustomOrder: true,
    partialFulfillmentRows: [
      {
        colorLabel: "Cream",
        colorHex: "#EDE8D8",
        cells: [
          { size: "S", qty: 10 },
          { size: "M", qty: 5 },
          { size: "L", qty: 8 },
          { size: "XXL", qty: 2 },
        ],
        totalQty: 25,
        totalPrice: 12_500,
      },
      {
        colorLabel: "Yellow",
        colorHex: "#EAB308",
        cells: [
          { size: "S", qty: 10 },
          { size: "L", qty: 5 },
          { size: "XXL", qty: 5 },
        ],
        totalQty: 20,
        totalPrice: 10_500,
      },
    ],
  }
}

function b2bPartialFulfillmentStats(): B2BFulfillmentStats {
  return {
    totalItems: 45,
    fulfilled: 0,
    delivered: 0,
    pending: 45,
  }
}

function mapOrderToDetails(order: AllOrder): OrderDetailsData {
  const [placedDateRaw, placedTimeRaw] = order.date.split(",");
  const amount = parseAmount(order.amount);
  const status = normalizeStatus(String(order.status));
  const placedDate = placedDateRaw?.trim() || order.date;
  const placedTime = placedTimeRaw?.trim() || "10:30 AM";
  const gst = Math.round(amount * 0.18);

  const isB2B = order.type === "B2B"
  const isPartialB2B = isB2B && status === "partial"

  return {
    id: order.id,
    placedDate,
    placedTime,
    status,
    customer: {
      name: order.vendor,
      email: `${order.vendor.toLowerCase().replaceAll(/\s+/g, ".")}@example.com`,
      phone: "+91 9876543210",
      address: "123 Market Street, Mumbai, Maharashtra, India",
      tag: order.type,
    },
    payment: {
      method: isPartialB2B
        ? "Wire Transfer"
        : order.paymentStatus === "Paid"
          ? "UPI"
          : "Cash on Delivery",
      status: order.paymentStatus,
      subtotal: amount,
      gst,
      shippingCharges: 0,
      total: amount + gst,
    },
    items: buildItems(order, amount),
    timeline: buildTimeline(status, placedDate),
    adminNotes: "",
    orderType: order.type,
    inventoryType: order.inventoryType,
    b2bLineItems: isB2B
      ? isPartialB2B
        ? [buildB2BPartialFulfillmentLine(order)]
        : [buildB2BLineDisplay(order)]
      : undefined,
    b2bFulfillmentStats: isPartialB2B ? b2bPartialFulfillmentStats() : undefined,
  };
}

/**
 * Fetch all orders. Replace body with: const res = await fetch('/api/orders'); return res.json();
 */
export async function getOrders(): Promise<AllOrder[]> {
  return mockOrders;
}

/**
 * Fetch order details by id. Replace body with API call once backend is integrated.
 */
export async function getOrderDetails(
  orderId: string,
): Promise<OrderDetailsData | null> {
  const order = mockOrders.find((item) => item.id === orderId);
  if (!order) return null;
  return mapOrderToDetails(order);
}
