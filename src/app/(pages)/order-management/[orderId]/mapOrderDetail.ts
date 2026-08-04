import { formatApiAddress, type ApiOrderDetail } from "@/lib/api/orders";
import { splitOrderDateTime } from "@/lib/utils";
import type { OrderDetailsData, OrderDetailUnfulfilledLine, ShipmentDisplay } from "@/components/shared/OrderDetails";
import { classifyShipmentKind, shipmentKindDisplayOrder } from "@/components/shared/order-details/types";

/** Maps the real GET /seller/orders/{order_id}/invoice response onto the UI's OrderDetailsData shape. */
export function mapApiOrderDetailToOrderDetailsData(detail: ApiOrderDetail): OrderDetailsData {
  const isB2B = detail.channel?.toLowerCase() === "b2b";
  const orderType = isB2B ? "B2B" : "B2C";

  const shippingAddress = formatApiAddress(detail.customer.shipping_address);
  const billingAddress = formatApiAddress(detail.customer.billing_address);

  // Join shipment items back to their order line by ID (never by array index — a line can be
  // split across multiple shipments), so display prefers the line's canonical product info.
  const lineById = new Map(detail.lines.filter((l) => l.id).map((l) => [l.id as string, l]));

  const shipments: ShipmentDisplay[] = detail.shipments.map((s) => ({
    id: s.id,
    createdAt: s.created_at,
    trackingNumber: s.tracking_number,
    warehouse: s.warehouse ?? null,
    kind: classifyShipmentKind(s.saleor_status),
    items: s.items.map((item) => {
      const line = item.order_line_id ? lineById.get(item.order_line_id) : undefined;
      const productName = line?.product_name ?? item.product_name;
      const variantName = line?.variant_name ?? item.variant_name;
      // Cancellable is a property of the *order line*, not of this parcel: it's the
      // unshipped, un-cancelled remainder. Units already in a shipment aren't cancellable
      // (Saleor can't remove a line from a fulfillment), so a fully-shipped line reads 0.
      const cancellable = line
        ? Math.max(
            0,
            (line.quantity_to_fulfill ?? 0) - (line.cancelled_quantity ?? 0),
          )
        : 0;
      return {
        name: variantName ? `${productName} (${variantName})` : productName,
        quantity: item.quantity,
        orderLineId: item.order_line_id ?? null,
        sku: line?.sku ?? item.sku ?? null,
        cancellableQuantity: cancellable,
      };
    }),
    stepper: {
      currentStep: s.stepper.current_step,
      steps: s.stepper.steps.map((step) => ({
        key: step.key,
        label: step.label,
        completed: step.completed,
        timestamp: step.timestamp,
      })),
    },
  }));

  // Display order: this order's normal parcels first, then any replaced via an exchange, then
  // returned, then cancelled. Stable sort (JS Array.sort guarantees it) keeps each bucket's
  // relative order — shipments arrive from the backend in creation order.
  shipments.sort(
    (a, b) => shipmentKindDisplayOrder(a.kind) - shipmentKindDisplayOrder(b.kind),
  );

  // Sum what every existing shipment already claims per line, then subtract from each line's
  // total quantity — never by array index, since a line can be split across shipments.
  const shippedQtyByLine = new Map<string, number>();
  for (const shipment of detail.shipments) {
    for (const item of shipment.items) {
      if (!item.order_line_id) continue;
      shippedQtyByLine.set(item.order_line_id, (shippedQtyByLine.get(item.order_line_id) ?? 0) + item.quantity);
    }
  }

  const items = detail.lines.map((line) => {
    const total = line.total_price?.amount ?? line.unit_price.amount * line.quantity;
    const cancelledQuantity = line.cancelled_quantity ?? 0;
    const shipped = line.id ? (shippedQtyByLine.get(line.id) ?? 0) : 0;
    return {
      product: line.variant_name ? `${line.product_name} (${line.variant_name})` : line.product_name,
      sku: line.sku ?? "—",
      quantity: line.quantity,
      price: line.unit_price.amount,
      total,
      imageUrl: line.thumbnail?.url,
      orderLineId: line.id,
      cancelledQuantity,
      // Only unshipped, not-already-cancelled units can be cancelled. Mirrors the
      // backend's own NOTHING_TO_CANCEL guard.
      cancellableQuantity: Math.max(0, line.quantity - shipped - cancelledQuantity),
    };
  });
  const computedSubtotal = items.reduce((sum, item) => sum + item.total, 0);
  const subtotal = detail.subtotal?.amount ?? computedSubtotal;
  const shippingCharges = detail.shipping?.price.amount ?? 0;
  const total = detail.total?.amount ?? subtotal + shippingCharges;
  // Any residual once subtotal + shipping are accounted for (tax, etc.) — never negative.
  const gst = Math.max(0, total - subtotal - shippingCharges);
  // Informational only — in sample data this isn't reflected in subtotal/total math (already netted
  // in elsewhere), so it's surfaced as an FYI line rather than subtracted a second time.
  const discount = (detail.discounts ?? []).reduce((sum, d) => sum + d.amount.amount, 0);

  // Prefer the order's own placed date; fall back to the earliest shipment if it's ever missing.
  const earliestShipment = [...detail.shipments].sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
  const { date: placedDate, time: placedTime } = splitOrderDateTime(detail.invoice_date ?? earliestShipment?.created_at);

  // Cancelled units are subtracted too — a cancelled line must never be offered for
  // shipment (the backend rejects it outright).
  const unfulfilledLines: OrderDetailUnfulfilledLine[] = detail.lines
    .filter((line) => line.id && line.sku)
    .map((line) => ({
      orderLineId: line.id as string,
      skuId: line.sku as string,
      productName: line.variant_name ? `${line.product_name} (${line.variant_name})` : line.product_name,
      quantity:
        line.quantity -
        (shippedQtyByLine.get(line.id as string) ?? 0) -
        (line.cancelled_quantity ?? 0),
    }))
    .filter((line) => line.quantity > 0);

  return {
    id: detail.invoice_number,
    placedDate,
    placedTime,
    status: detail.status,
    customer: {
      name: detail.customer.name,
      email: detail.customer.email,
      phone: detail.customer.phone ?? "—",
      address: shippingAddress || billingAddress || "—",
      shippingAddress: shippingAddress || undefined,
      billingAddress: billingAddress || undefined,
      tag: orderType,
    },
    payment: {
      // Shipping carrier (detail.shipping.method) is a different concept from payment method,
      // which this contract doesn't provide — left blank rather than substituting one for the other.
      method: "—",
      status: detail.payment_status,
      subtotal,
      gst,
      shippingCharges,
      total,
      discount,
    },
    items,
    timeline: [],
    orderType,
    shipments,
    unfulfilledLines,
    deliveryPincode: detail.customer.shipping_address?.postal_code ?? null,
    invoiceNumber: detail.invoice_number,
    orderNumber: detail.order_number,
    channel: isB2B ? "b2b" : "b2c",
  };
}
