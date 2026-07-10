import { useState } from "react";

export type SortColumnBinding = {
  columnKey: string;
  /** Saleor ProductOrderField value, e.g. "NAME", "DATE" */
  sortField: string;
  initialOrder: "ASC" | "DESC";
};

export type ServerSortState = {
  sortBy: string;
  sortOrder: "ASC" | "DESC";
};

/**
 * Three-click cycle server sort:
 *  1st click → initial direction for that column
 *  2nd click → opposite direction
 *  3rd click → reset to defaultSort
 */
export function useServerTableSort(
  bindings: SortColumnBinding[],
  defaultSort: ServerSortState,
): {
  sortBy: string;
  sortOrder: "ASC" | "DESC";
  serverSortKey: string | null;
  serverSortDirection: "asc" | "desc" | null;
  handleServerSortColumn: (columnKey: unknown) => void;
} {
  const [sort, setSort] = useState<ServerSortState>(defaultSort);

  const activeBinding = bindings.find((b) => b.sortField === sort.sortBy) ?? null;
  const serverSortKey = activeBinding?.columnKey ?? null;
  const serverSortDirection: "asc" | "desc" | null = activeBinding
    ? (sort.sortOrder.toLowerCase() as "asc" | "desc")
    : null;

  const handleServerSortColumn = (columnKey: unknown) => {
    const key = String(columnKey);
    const binding = bindings.find((b) => b.columnKey === key);
    if (!binding) return;
    setSort((prev) => {
      if (prev.sortBy !== binding.sortField) {
        return { sortBy: binding.sortField, sortOrder: binding.initialOrder };
      }
      const isInitialDir = prev.sortOrder === binding.initialOrder;
      if (isInitialDir) {
        const flipped: "ASC" | "DESC" = binding.initialOrder === "DESC" ? "ASC" : "DESC";
        return { sortBy: binding.sortField, sortOrder: flipped };
      }
      return defaultSort;
    });
  };

  return { sortBy: sort.sortBy, sortOrder: sort.sortOrder, serverSortKey, serverSortDirection, handleServerSortColumn };
}
