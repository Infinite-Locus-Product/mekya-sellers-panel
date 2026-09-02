import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { OrderItemSection } from "./OrderItemSection";
import { mapApiOrderDetailToOrderDetailsData } from "@/app/(pages)/order-management/[orderId]/mapOrderDetail";
import type { ApiOrderDetail } from "@/lib/api/orders";

afterEach(cleanup);

/** The real GET /seller/orders/ORD-20260821-SDC1VN response, trimmed to the fields the items
 *  table reads. Three single-unit lines: two delivered in their own parcels, the third
 *  cancelled. The page badged the order "Partially Cancelled" while every item read as though
 *  it had shipped, because the table had no status column at all. */
const SDC1VN = {
  invoice_number: "ORD-20260821-SDC1VN",
  invoice_date: "2026-08-21T12:51:54.036910+00:00",
  order_number: "116",
  status: "Partially Cancelled",
  channel: "b2c",
  customer: { name: "Aarav Sharma", email: "batman1070157@gmail.com" },
  subtotal: { amount: 2997.0, currency: "INR" },
  total: { amount: 3012.0, currency: "INR" },
  lines: [
    {
      id: "L_black_l",
      product_name: "Test Product T Shirt",
      variant_name: "L",
      sku: "VXNl-085809a9-black-l",
      quantity: 1,
      quantity_to_fulfill: 0,
      cancelled_quantity: 0,
      unit_price: { amount: 999.0, currency: "INR" },
      total_price: { amount: 999.0, currency: "INR" },
    },
    {
      id: "L_black_m",
      product_name: "Test Product T Shirt",
      variant_name: "M",
      sku: "VXNl-085809a9-black-m",
      quantity: 1,
      quantity_to_fulfill: 0,
      cancelled_quantity: 0,
      unit_price: { amount: 999.0, currency: "INR" },
      total_price: { amount: 999.0, currency: "INR" },
    },
    {
      // The cancelled one. Saleor still reports a unit to fulfil here — it does not know
      // about Mekya's line cancellation — so anything reading quantity_to_fulfill raw would
      // call this pending rather than cancelled.
      id: "L_grey_l",
      product_name: "Test Product T Shirt",
      variant_name: "L",
      sku: "VXNl-085809a9-grey-l",
      quantity: 1,
      quantity_to_fulfill: 1,
      cancelled_quantity: 1,
      unit_price: { amount: 999.0, currency: "INR" },
      total_price: { amount: 999.0, currency: "INR" },
    },
  ],
  shipments: [
    {
      id: "RnVsZmlsbG1lbnQ6MTYy",
      created_at: "2026-08-22T07:02:31.045059+00:00",
      tracking_number: "",
      warehouse: "Test Warehouse 01",
      saleor_status: "FULFILLED",
      items: [
        {
          order_line_id: "L_black_m",
          product_name: "Test Product T Shirt",
          variant_name: "M",
          quantity: 1,
        },
      ],
      stepper: { current_step: "Delivered", steps: [] },
    },
    {
      id: "RnVsZmlsbG1lbnQ6MTYz",
      created_at: "2026-08-22T07:15:08.914463+00:00",
      tracking_number: "",
      warehouse: "Test Warehouse 01",
      saleor_status: "FULFILLED",
      items: [
        {
          order_line_id: "L_black_l",
          product_name: "Test Product T Shirt",
          variant_name: "L",
          quantity: 1,
        },
      ],
      stepper: { current_step: "Delivered", steps: [] },
    },
  ],
} as unknown as ApiOrderDetail;

function renderItems(detail: ApiOrderDetail) {
  const mapped = mapApiOrderDetailToOrderDetailsData(detail);
  render(
    <OrderItemSection
      orderType={mapped.orderType}
      items={mapped.items}
      formatCurrency={(n) => `₹${n}`}
    />,
  );
  return mapped;
}

/** The status chips in document order, one entry per rendered row. */
function statusCells(): string[] {
  const rows = screen.getAllByRole("row").slice(1, -1); // drop the header and TOTAL rows
  return rows.map((row) => row.querySelectorAll("td")[3]?.textContent?.trim() ?? "");
}

describe("OrderItemSection — the SDC1VN partially-cancelled order", () => {
  it("shows the cancelled unit as Cancelled, not as delivered", () => {
    renderItems(SDC1VN);
    expect(statusCells()).toEqual(["Delivered", "Delivered", "Cancelled"]);
  });

  it("still lists every ordered line", () => {
    const mapped = renderItems(SDC1VN);
    expect(mapped.items).toHaveLength(3);
    expect(screen.getByText("3 item(s) in this order")).toBeInTheDocument();
    expect(screen.getByText("VXNl-085809a9-grey-l")).toBeInTheDocument();
  });

  it("gives the cancelled chip a different treatment from the delivered ones", () => {
    renderItems(SDC1VN);
    // Colour is the at-a-glance signal; a cancelled unit sharing the delivered styling is
    // the bug in a different disguise.
    const cancelled = screen.getByText("Cancelled");
    const delivered = screen.getAllByText("Delivered")[0];
    expect(cancelled.className).not.toEqual(delivered.className);
    expect(cancelled.className).toContain("red");
  });

  it("adds a Status column header", () => {
    renderItems(SDC1VN);
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeInTheDocument();
  });

  it("labels a split line with counts instead of one misleading state", () => {
    const split = structuredClone(SDC1VN) as unknown as {
      lines: Array<Record<string, unknown>>;
      shipments: Array<Record<string, unknown>>;
    };
    split.lines = [{ ...split.lines[0], id: "L1", quantity: 4, cancelled_quantity: 1 }];
    split.shipments = [
      {
        ...split.shipments[0],
        items: [{ order_line_id: "L1", product_name: "P", quantity: 2 }],
        stepper: { current_step: "Delivered", steps: [] },
      },
      {
        ...split.shipments[1],
        items: [{ order_line_id: "L1", product_name: "P", quantity: 1 }],
        stepper: { current_step: "Shipped", steps: [] },
      },
    ];
    renderItems(split as unknown as ApiOrderDetail);
    expect(statusCells()[0]).toBe("2 Delivered1 Shipped1 Cancelled");
  });
});
