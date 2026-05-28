import { describe, it, expect } from "vitest";
import { selectSegmentTableColumns } from "./selectTableColumns";
import type { TableColumn } from "@/components/shared/DataTable";
import type { AllOrder } from "@/lib/tableTypes";

const mk = (key: string): TableColumn<AllOrder>[] => [{ key, header: key } as TableColumn<AllOrder>];

describe("selectSegmentTableColumns", () => {
    const sets = {
        customOrdersColumns: mk("custom"),
        allOrdersColumns: mk("all"),
        b2bAllOrdersColumns: mk("b2b"),
        returnRequestsColumns: mk("returns"),
    };

    it("B2B returns → custom columns", () => {
        expect(selectSegmentTableColumns("returns", "b2b", sets)[0].key).toBe("custom");
    });

    it("B2C returns → return request columns", () => {
        expect(selectSegmentTableColumns("returns", "b2c", sets)[0].key).toBe("returns");
    });

    it("B2B all → b2b bulk columns", () => {
        expect(selectSegmentTableColumns("all", "b2b", sets)[0].key).toBe("b2b");
    });

    it("B2C all → consumer columns", () => {
        expect(selectSegmentTableColumns("all", "b2c", sets)[0].key).toBe("all");
    });
});
