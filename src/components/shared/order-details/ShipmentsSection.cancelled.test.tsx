import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ShipmentsSection } from "./ShipmentsSection";
import { mapApiOrderDetailToOrderDetailsData } from "@/app/(pages)/order-management/[orderId]/mapOrderDetail";
import type { ApiOrderDetail } from "@/lib/api/orders";

afterEach(cleanup);

/** GET /seller/orders/ORD-20260821-SDC1VN. Two single-unit lines delivered in their own
 *  parcels, a third cancelled. The shipments view is what the order list's expanded row
 *  renders, and it showed only the two Delivered parcels — the cancelled unit was in no
 *  parcel and `unfulfilledLines` (rightly) excludes cancelled units, so nothing on screen
 *  accounted for it. On an order badged "Partially Cancelled", every item read as delivered. */
function sdc1vn(): ApiOrderDetail {
  const line = (
    id: string,
    variant: string,
    sku: string,
    cancelled = 0,
    toFulfill = 0,
  ) => ({
    id,
    product_name: "Test Product T Shirt",
    variant_name: variant,
    sku,
    quantity: 1,
    quantity_to_fulfill: toFulfill,
    cancelled_quantity: cancelled,
    unit_price: { amount: 999.0, currency: "INR" },
    total_price: { amount: 999.0, currency: "INR" },
  });
  const parcel = (id: string, orderLineId: string, variant: string) => ({
    id,
    created_at: "2026-08-22T07:02:31.045059+00:00",
    tracking_number: "",
    warehouse: "Test Warehouse 01",
    saleor_status: "FULFILLED",
    items: [
      {
        order_line_id: orderLineId,
        product_name: "Test Product T Shirt",
        variant_name: variant,
        quantity: 1,
      },
    ],
    stepper: { current_step: "Delivered", steps: [] },
  });
  return {
    invoice_number: "ORD-20260821-SDC1VN",
    invoice_date: "2026-08-21T12:51:54.036910+00:00",
    order_number: "116",
    status: "Partially Cancelled",
    channel: "b2c",
    customer: { name: "Aarav Sharma", email: "batman1070157@gmail.com" },
    lines: [
      line("L_black_l", "L", "VXNl-085809a9-black-l"),
      line("L_black_m", "M", "VXNl-085809a9-black-m"),
      // Saleor still reports a unit to fulfil here — it does not know about Mekya's line
      // cancellation.
      line("L_grey_l", "L", "VXNl-085809a9-grey-l", 1, 1),
    ],
    shipments: [
      parcel("RnVsZmlsbG1lbnQ6MTYy", "L_black_m", "M"),
      parcel("RnVsZmlsbG1lbnQ6MTYz", "L_black_l", "L"),
    ],
  } as unknown as ApiOrderDetail;
}

function renderShipments(detail: ApiOrderDetail) {
  const mapped = mapApiOrderDetailToOrderDetailsData(detail);
  render(
    <ShipmentsSection
      shipments={mapped.shipments ?? []}
      orderId={mapped.id}
      unfulfilledLines={mapped.unfulfilledLines}
      cancelledLines={mapped.cancelledLines}
      orderStatus={mapped.status}
    />,
  );
  return mapped;
}

describe("ShipmentsSection — cancelled units", () => {
  it("accounts for the cancelled unit instead of showing only delivered parcels", () => {
    renderShipments(sdc1vn());
    expect(screen.getByText("Not shipped")).toBeInTheDocument();
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
    expect(screen.getByText("VXNl-085809a9-grey-l")).toBeInTheDocument();
  });

  it("still shows both delivered parcels", () => {
    renderShipments(sdc1vn());
    expect(screen.getAllByText("Delivered")).toHaveLength(2);
  });

  it("never offers a cancelled unit for shipment", () => {
    // The backend rejects it outright, so it must not reach the fulfil picker.
    const mapped = renderShipments(sdc1vn());
    expect(mapped.unfulfilledLines).toEqual([]);
    expect(screen.queryByText(/Select items to fulfil/)).not.toBeInTheDocument();
  });

  it("adds nothing when no unit was cancelled", () => {
    const clean = sdc1vn() as unknown as { lines: Array<Record<string, unknown>> };
    clean.lines = clean.lines.slice(0, 2);
    renderShipments(clean as unknown as ApiOrderDetail);
    expect(screen.queryByText("Not shipped")).not.toBeInTheDocument();
  });

  it("shows cancelled units even when the order has no parcels at all", () => {
    // The empty state used to say "Nothing left to fulfil", which is true but says nothing
    // about the units that were cancelled.
    const noParcels = sdc1vn() as unknown as {
      lines: Array<Record<string, unknown>>;
      shipments: unknown[];
    };
    noParcels.shipments = [];
    noParcels.lines = [
      {
        ...noParcels.lines[2],
        quantity: 2,
        cancelled_quantity: 2,
      },
    ];
    renderShipments(noParcels as unknown as ApiOrderDetail);
    expect(screen.getByText("Not shipped")).toBeInTheDocument();
    expect(screen.getByText("Qty: 2")).toBeInTheDocument();
    expect(screen.queryByText(/Nothing left to fulfil/)).not.toBeInTheDocument();
  });

  it("reports the cancelled quantity, not the line quantity", () => {
    const partial = sdc1vn() as unknown as { lines: Array<Record<string, unknown>> };
    partial.lines = [{ ...partial.lines[2], quantity: 5, cancelled_quantity: 2 }];
    const mapped = renderShipments(partial as unknown as ApiOrderDetail);
    expect(mapped.cancelledLines).toEqual([
      {
        orderLineId: "L_grey_l",
        productName: "Test Product T Shirt (L)",
        sku: "VXNl-085809a9-grey-l",
        quantity: 2,
      },
    ]);
    expect(screen.getByText("Qty: 2")).toBeInTheDocument();
  });
});
