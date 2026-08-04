import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CancelShipmentItemAction } from "./CancelShipmentItemAction";

const cancelShipmentItems = vi.fn();
const toastSuccess = vi.fn();
const toastWarning = vi.fn();
const toastError = vi.fn();

vi.mock("@/lib/api/orders", () => ({
  cancelShipmentItems: (...args: unknown[]) => cancelShipmentItems(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...a: unknown[]) => toastSuccess(...a),
    warning: (...a: unknown[]) => toastWarning(...a),
    error: (...a: unknown[]) => toastError(...a),
  },
}));

function ok(over: Record<string, unknown> = {}) {
  return {
    order_id: "ORD-1",
    cancelled_shipment_id: "F_old",
    new_shipment_id: "F_new",
    cancelled_lines: [
      { saleor_order_line_id: "L1", quantity: 1, product_name: "Tee", sku: "S1" },
    ],
    kept_lines: [],
    repack_failed: false,
    reason: "Out of stock",
    restocked: true,
    cancelled_at: "2026-08-05T00:00:00Z",
    ...over,
  };
}

function renderAction(packedQuantity = 3) {
  const onDone = vi.fn();
  render(
    <CancelShipmentItemAction
      orderId="ORD-1"
      fulfillmentId="F_old"
      orderLineId="L1"
      productName="Tee"
      packedQuantity={packedQuantity}
      onDone={onDone}
    />,
  );
  // The trigger and the modal's footer both read "Cancel"-ish; the trigger is the only
  // button present before opening.
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  return { onDone };
}

const confirmBtn = () => screen.getByRole("button", { name: /confirm cancellation/i });
const qtyInput = () => screen.getByLabelText(/quantity to cancel/i);
const setQty = (v: string) => fireEvent.change(qtyInput(), { target: { value: v } });

beforeEach(() => vi.clearAllMocks());
afterEach(() => cleanup());

describe("CancelShipmentItemAction", () => {
  it("submits the typed quantity, reason and restock choice", async () => {
    cancelShipmentItems.mockResolvedValue(ok());
    const { onDone } = renderAction(3);

    setQty("2");
    fireEvent.click(confirmBtn());

    await waitFor(() => expect(cancelShipmentItems).toHaveBeenCalledTimes(1));
    expect(cancelShipmentItems).toHaveBeenCalledWith("ORD-1", "F_old", {
      lines: [{ line_id: "L1", quantity: 2 }],
      reason: "Customer requested cancellation",
      restock: true,
    });
    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });

  it("lets the field be cleared without snapping back to 1", () => {
    renderAction(3);
    setQty("");
    expect(qtyInput()).toHaveValue("");
    // Nothing valid to submit yet, so the destructive action stays disabled.
    expect(confirmBtn()).toBeDisabled();
  });

  it("explains an over-cap quantity and blocks submit instead of silently clamping", () => {
    renderAction(3);
    setQty("9");

    expect(screen.getByRole("alert")).toHaveTextContent("Only 3 units available here.");
    expect(qtyInput()).toHaveValue("9"); // not rewritten under the cursor
    expect(confirmBtn()).toBeDisabled();
    expect(cancelShipmentItems).not.toHaveBeenCalled();
  });

  it("rejects a non-integer rather than coercing it", () => {
    renderAction(5);
    setQty("1.5");
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(confirmBtn()).toBeDisabled();
  });

  it("warns rather than reporting success when the parcel could not be repacked", async () => {
    cancelShipmentItems.mockResolvedValue(ok({ repack_failed: true, new_shipment_id: null }));
    renderAction(2);
    fireEvent.click(confirmBtn());

    await waitFor(() => expect(toastWarning).toHaveBeenCalled());
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(String(toastWarning.mock.calls[0][0])).toContain("wasn't rebuilt");
  });

  it("surfaces the server message on failure and keeps the modal open", async () => {
    cancelShipmentItems.mockRejectedValue(new Error("Shipment already dispatched"));
    const { onDone } = renderAction(2);
    fireEvent.click(confirmBtn());

    await waitFor(() => expect(toastError).toHaveBeenCalled());
    expect(toastError.mock.calls[0][1]).toMatchObject({
      description: "Shipment already dispatched",
    });
    expect(onDone).not.toHaveBeenCalled();
    expect(confirmBtn()).toBeInTheDocument();
  });

  it("caps the stepper at the packed quantity", () => {
    renderAction(1);
    // Only one unit in the parcel: no "All N" shortcut, and neither stepper button applies.
    expect(screen.queryByRole("button", { name: /^All / })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
  });
});
