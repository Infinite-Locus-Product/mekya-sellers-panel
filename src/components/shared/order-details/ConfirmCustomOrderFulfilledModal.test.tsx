import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { ConfirmCustomOrderFulfilledModal } from "./ConfirmCustomOrderFulfilledModal";
import type { OrderCustomOrderLink } from "./types";

afterEach(cleanup);

const LINK: OrderCustomOrderLink = {
  id: "44ed9c89-2456-48b2-bbca-8fc83c7b4a1a",
  customStatus: "buyer_confirmed",
  contactPerson: "Govind Test",
  customerEmail: "govindtest56@gmail.com",
};

function setup(overrides: Partial<Parameters<typeof ConfirmCustomOrderFulfilledModal>[0]> = {}) {
  const onConfirm = vi.fn();
  const onViewCustomOrder = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <ConfirmCustomOrderFulfilledModal
      open
      onOpenChange={onOpenChange}
      customOrder={LINK}
      itemCount={2}
      onViewCustomOrder={onViewCustomOrder}
      onConfirm={onConfirm}
      {...overrides}
    />
  );
  return { onConfirm, onViewCustomOrder, onOpenChange };
}

describe("ConfirmCustomOrderFulfilledModal", () => {
  it("asks whether the custom work is actually done", () => {
    setup();
    expect(screen.getByText("Is this custom order fulfilled?")).toBeInTheDocument();
    expect(screen.getByText(/2 items/)).toBeInTheDocument();
  });

  it("only proceeds when the seller confirms", () => {
    const { onConfirm } = setup();
    fireEvent.click(screen.getByRole("button", { name: /Yes, continue/ }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("declining changes nothing — it just closes", () => {
    // "Not yet" must never create a shipment or touch the custom order; a mis-click has to
    // be free.
    const { onConfirm, onOpenChange } = setup();
    fireEvent.click(screen.getByRole("button", { name: /Not yet/ }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("offers the linked custom order and opens it without confirming", () => {
    const { onViewCustomOrder, onConfirm } = setup();
    fireEvent.click(screen.getByRole("button", { name: /View custom order request/ }));
    expect(onViewCustomOrder).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("identifies the request by contact and status", () => {
    setup();
    expect(screen.getByText(/Govind Test/)).toBeInTheDocument();
    expect(screen.getByText(/buyer confirmed/)).toBeInTheDocument();
  });

  it("falls back to the buyer email when no contact name is on file", () => {
    setup({ customOrder: { ...LINK, contactPerson: null } });
    expect(screen.getByText(/govindtest56@gmail.com/)).toBeInTheDocument();
  });

  it("uses singular wording for a single item", () => {
    setup({ itemCount: 1 });
    expect(screen.getByText(/1 item/)).toBeInTheDocument();
    expect(screen.queryByText(/1 items/)).not.toBeInTheDocument();
  });
});
