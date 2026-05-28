import type { TableColumn } from "@/components/shared/DataTable";
import type { AllOrder } from "@/lib/tableTypes";

export interface SegmentTableColumnSets {
    readonly customOrdersColumns: TableColumn<AllOrder>[];
    readonly allOrdersColumns: TableColumn<AllOrder>[];
    readonly b2bAllOrdersColumns: TableColumn<AllOrder>[];
    readonly returnRequestsColumns: TableColumn<AllOrder>[];
}

/** Chooses the column set for the current segment + order view (same branching as the table UI). */
export function selectSegmentTableColumns(
    orderView: "all" | "returns",
    segment: "b2c" | "b2b",
    sets: SegmentTableColumnSets
): TableColumn<AllOrder>[] {
    if (orderView === "returns") {
        return segment === "b2b" ? sets.customOrdersColumns : sets.returnRequestsColumns;
    }
    return segment === "b2b" ? sets.b2bAllOrdersColumns : sets.allOrdersColumns;
}
