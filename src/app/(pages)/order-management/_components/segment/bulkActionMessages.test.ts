import { describe, it, expect } from "vitest";
import { getBulkActionSuccessMessage } from "./bulkActionMessages";

describe("getBulkActionSuccessMessage", () => {
    it("formats update_status with typographic quotes", () => {
        expect(
            getBulkActionSuccessMessage("update_status", 2, { newOrderStatus: "Fulfilled" })
        ).toBe(`🎉 Updated 2 orders to \u201cFulfilled\u201d`);
    });

    it("formats generate_invoice singular", () => {
        expect(getBulkActionSuccessMessage("generate_invoice", 1, undefined)).toBe(
            "🎉 Successfully generated 1 invoice for 1 order"
        );
    });

    it("falls back to generic completion", () => {
        expect(getBulkActionSuccessMessage("other", 3, undefined)).toBe(
            "🎉 Bulk action completed for 3 orders"
        );
    });
});
