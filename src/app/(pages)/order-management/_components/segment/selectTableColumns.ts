import type { TableColumn } from "@/components/shared/DataTable";
import type { AllOrder } from "@/lib/tableTypes";
import type { OrderManagementTabId } from "./constants";

export interface SegmentTableColumnSets {
    readonly allOrdersColumns: TableColumn<AllOrder>[];
    readonly b2bAllOrdersColumns: TableColumn<AllOrder>[];
    readonly returnRequestsColumns: TableColumn<AllOrder>[];
}

/**
 * Chooses the AllOrder-based column set for the current segment + tab.
 * Not selected here — each renders its own differently-typed table via a dedicated DataTable in
 * OrderManagementSegmentClient, since these are distinct resources, not AllOrder rows: B2B's Custom
 * Orders tab (`CustomOrderRequestRow[]`), Exchange (`ExchangeOrderRow[]`), and Cancellation (`CancellationRow[]`).
 */
export function selectSegmentTableColumns(
    tab: OrderManagementTabId,
    segment: "b2c" | "b2b",
    sets: SegmentTableColumnSets
): TableColumn<AllOrder>[] {
    if (tab === "returns") {
        return sets.returnRequestsColumns;
    }
    return segment === "b2b" ? sets.b2bAllOrdersColumns : sets.allOrdersColumns;
}
