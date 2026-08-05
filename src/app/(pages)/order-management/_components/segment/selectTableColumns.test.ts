import { describe, it, expect } from "vitest";
import { selectSegmentTableColumns } from "./selectTableColumns";
import type { TableColumn } from "@/components/shared/DataTable";
import type { AllOrder } from "@/lib/tableTypes";

const mk = (key: string): TableColumn<AllOrder>[] => [{ key, header: key } as TableColumn<AllOrder>];

describe("selectSegmentTableColumns", () => {
    const sets = {
        allOrdersColumns: mk("all"),
        b2bAllOrdersColumns: mk("b2b"),
        returnRequestsColumns: mk("returns"),
    };

    it("B2C returns → return request columns", () => {
        expect(selectSegmentTableColumns("returns", "b2c", sets)[0].key).toBe("returns");
    });

    it("B2B orders → b2b bulk columns", () => {
        expect(selectSegmentTableColumns("orders", "b2b", sets)[0].key).toBe("b2b");
    });

    it("B2C orders → consumer columns", () => {
        expect(selectSegmentTableColumns("orders", "b2c", sets)[0].key).toBe("all");
    });

    // Exchange and Cancellation are their own resources now (ExchangeOrderRow / CancellationRow),
    // rendered via a dedicated DataTable in OrderManagementSegmentClient — not routed through this
    // AllOrder-column selector, so they fall back to the segment's default order columns here.
    it("exchange → falls back to segment default (not routed through this selector)", () => {
        expect(selectSegmentTableColumns("exchange", "b2c", sets)[0].key).toBe("all");
    });

    it("cancellation → falls back to segment default (not routed through this selector)", () => {
        expect(selectSegmentTableColumns("cancellation", "b2c", sets)[0].key).toBe("all");
    });
});
