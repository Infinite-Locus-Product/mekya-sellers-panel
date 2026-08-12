"use client"

import { cn } from "@/lib/utils"
import { Fragment, ReactNode, useCallback, useState } from "react"
import { TableSortIcon } from "@/assets/icons/shared"
import { Pagination } from "@/components/shared/Pagination"

export type TableRowHelpers = {
  rowIndex: number
  rowKey: string | number
  isRowMuted: boolean
  toggleRowMute: () => void
}

export type TableColumn<T> = {
  key: keyof T | string
  header: string | ReactNode
  cell?: (row: T, helpers: TableRowHelpers) => ReactNode
  align?: "left" | "center" | "right"
  className?: string
  sortable?: boolean
  checkbox?: boolean
}

/** Pass from the parent together with paginated `data` and `usePagination` (or equivalent). */
export type DataTablePaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize: number
  onPageSizeChange: (pageSize: number) => void
  /** Length of the full filtered dataset (not only the current page). */
  totalRowCount: number
  pageSizeOptions?: readonly number[]
  /** Extra classes on the footer wrapper below the table (default includes `mt-4` and horizontal/vertical padding). */
  footerClassName?: string
  /** Extra classes passed to `Pagination` root. */
  paginationClassName?: string
}

interface DataTableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  emptyMessage?: string
  onSelectAll?: (selected: boolean) => void
  onSelectRow?: (row: T, selected: boolean) => void
  selectedRows?: Set<T>
  bodyRowClassName?: string
  striped?: boolean
  pagination?: DataTablePaginationProps
  /** Simple server-sort model: caller re-fetches on click, tracks key/direction itself. */
  onServerSortColumn?: (columnKey: string | keyof T) => void
  serverSortKey?: string | keyof T | null
  serverSortDirection?: "asc" | "desc" | null
  /**
   * Controlled-sort model — pass together with `onSortChange` when `data` is already sorted by
   * the caller (e.g. server-side) and the table should report the requested (key, direction)
   * back explicitly. Either this or the onServerSortColumn model disables client-side re-sort.
   */
  sortConfig?: { key: string; direction: "asc" | "desc" } | null
  onSortChange?: (key: string, direction: "asc" | "desc") => void
  /**
   * Opt-in row expansion — a row whose id (via `getRowId`) is in `expandedRowIds` renders an
   * extra full-width row directly beneath it via `renderExpandedRow`. All three must be provided
   * together; omit all for a plain flat table (the default).
   */
  getRowId?: (row: T) => string
  expandedRowIds?: Set<string>
  renderExpandedRow?: (row: T) => ReactNode
}

function isStandaloneCheckboxColumn<T>(col: TableColumn<T>): boolean {
  const headerEmpty =
    col.header === "" || col.header === null || col.header === undefined
  return Boolean(col.checkbox && headerEmpty && !col.sortable && !col.cell)
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = "No data available",
  onSelectAll,
  onSelectRow,
  selectedRows = new Set(),
  bodyRowClassName,
  striped = false,
  pagination,
  onServerSortColumn,
  serverSortKey = null,
  serverSortDirection = null,
  sortConfig: controlledSortConfig,
  onSortChange,
  getRowId,
  expandedRowIds,
  renderExpandedRow,
}: DataTableProps<T>) {
  const isControlledSort = onSortChange !== undefined
  const [internalSortConfig, setInternalSortConfig] = useState<{
    key: string | keyof T
    direction: "asc" | "desc"
  } | null>(null)
  const sortConfig = isControlledSort ? controlledSortConfig ?? null : internalSortConfig
  const [mutedRowKeys, setMutedRowKeys] = useState<Set<string | number>>(() => new Set())

  const toggleRowMute = useCallback((key: string | number) => {
    setMutedRowKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  // Centred by default, for headers and body cells alike. `table-fixed` splits whatever width
  // the sized columns (status pills, actions) don't claim equally between the rest, so a short
  // value like an amount used to sit hard left in a column far wider than itself and read as an
  // empty column rather than as padding. A column opts out with align: "left" | "right".
  const getAlignClass = (align: TableColumn<T>["align"]) => {
    if (align === "left") return "text-left"
    if (align === "right") return "text-right"
    return "text-center"
  }

  const handleSort = (key: string | keyof T) => {
    if (onServerSortColumn) {
      onServerSortColumn(key)
      return
    }
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    if (isControlledSort) {
      onSortChange!(String(key), direction)
    } else {
      setInternalSortConfig({ key, direction })
    }
  }

  // Neither server-sort model re-sorts client-side — the caller already returned sorted data.
  const isServerSorted = Boolean(onServerSortColumn) || isControlledSort
  const sortedData = isServerSorted ? data : [...data]
  if (!isServerSorted && sortConfig) {
    const key = sortConfig.key as keyof T
    sortedData.sort((a, b) => {
      const aValue: T[keyof T] = a[key]
      const bValue: T[keyof T] = b[key]
      if (typeof aValue === "string" && aValue.includes("₹")) {
        const aNum = parseFloat(aValue.replace(/[₹,]/g, "")) || 0
        const bNum = parseFloat(String(bValue).replace(/[₹,]/g, "")) || 0
        if (aNum === bNum) return 0
        const comparison = aNum < bNum ? -1 : 1
        return sortConfig.direction === "asc" ? comparison : -comparison
      }

      if (aValue === bValue) return 0

      const comparison = aValue < bValue ? -1 : 1
      return sortConfig.direction === "asc" ? comparison : -comparison
    })
  }

  const getRowKey = (row: T, rowIdx: number): string | number => {
    const record = row as Record<string, unknown>
    return record.id != null ? String(record.id) : rowIdx
  }

  const allSelected =
    data.length > 0 && data.every((row) => selectedRows.has(row))
  const someSelected =
    data.length > 0 &&
    !allSelected &&
    data.some((row) => selectedRows.has(row))

  const renderSortableHeaderButton = (col: TableColumn<T>) => {
    const isSorted = onServerSortColumn
      ? serverSortKey === col.key
      : sortConfig?.key === col.key
    const sortDirection = onServerSortColumn
      ? (isSorted ? serverSortDirection : null)
      : (isSorted ? (sortConfig?.direction ?? null) : null)
    const sortState = sortDirection === "asc" ? "asc" : sortDirection === "desc" ? "desc" : "none"

    return (
      <button
        type="button"
        onClick={() => handleSort(col.key)}
        className={cn(
          // No font-size classes here on purpose — inherits the <th>'s responsive
          // scale so sortable and non-sortable headers always match.
          "inline-flex w-full min-w-0 items-center gap-1 text-foreground transition-colors min-[1920px]:gap-2",
          "rounded-sm px-0.5 py-0.5 -my-1 min-[1920px]:py-1 hover:bg-black/[0.06] hover:text-foreground",
          // This button is the <th>'s whole content and is `inline-flex`, so the cell's own
          // text-align can't position it — it has to mirror getAlignClass's default itself,
          // otherwise sortable headers stay left while every other header centres.
          col.align === "right" && "justify-end text-right",
          col.align === "left" && "justify-start text-left",
          (col.align === "center" || !col.align) && "justify-center text-center"
        )}
        aria-label={`Sort by ${String(col.header)} ${sortDirection === "asc" ? "ascending" : sortDirection === "desc" ? "descending" : ""}`.trim()}
      >
        <span className="min-w-0">{col.header}</span>
        <TableSortIcon state={sortState} className="size-2.5 shrink-0 sm:size-3 min-[1920px]:size-3.5" />
      </button>
    )
  }

  const renderHeader = (col: TableColumn<T>) => {
    if (col.checkbox) {
      const selectAllCheckbox = (
        <input
          type="checkbox"
          checked={allSelected}
          ref={(input) => {
            if (input) input.indeterminate = someSelected
          }}
          onChange={(e) => onSelectAll?.(e.target.checked)}
          className="size-3.5 shrink-0 rounded border-gray-300 accent-black min-[1920px]:size-4"
          aria-label="Select all rows"
        />
      )

      if (isStandaloneCheckboxColumn(col)) {
        return selectAllCheckbox
      }

      return (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {selectAllCheckbox}
          {col.sortable ? renderSortableHeaderButton(col) : col.header}
        </div>
      )
    }

    if (col.sortable) {
      return renderSortableHeaderButton(col)
    }

    return col.header
  }

  const cellWrapClass =
    "min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] align-middle"

  // Headers still wrap between words, but never inside one. `overflow-wrap: anywhere` (which body
  // cells need, since they carry SKUs and URLs with no break opportunities) was splitting short
  // single-word titles mid-word in the narrower table-fixed columns — "WSP" rendered as "WS P",
  // "Inventory" as "Invento ry".
  const headerWrapClass = "min-w-0 whitespace-normal [overflow-wrap:normal] align-middle"

  return (
    <div className="w-full min-w-0">
      <div className="w-full min-w-0 max-w-full overflow-hidden rounded-md">
      <table className="w-full min-w-0 table-fixed border-collapse">
        <thead>
          <tr className="border-b">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  "bg-[#E8E9E8] px-2 py-1.5 text-[10px] font-normal leading-tight sm:px-3 sm:py-2 sm:text-[11px] xl:px-4 xl:py-2.5 xl:text-xs min-[1920px]:px-5 min-[1920px]:py-3 min-[1920px]:text-sm min-[1920px]:leading-normal",
                  headerWrapClass,
                  getAlignClass(col.align),
                  col.className
                )}
              >
                {renderHeader(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr className={bodyRowClassName}>
              <td
                colSpan={columns.length}
                className="p-3 text-center text-[11px] text-muted-foreground min-[1920px]:p-4 min-[1920px]:text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIdx) => {
              const isSelected = selectedRows.has(row)
              const rowKey = getRowKey(row, rowIdx)
              const isRowMuted = mutedRowKeys.has(rowKey)
              const rowHelpers: TableRowHelpers = {
                rowIndex: rowIdx,
                rowKey,
                isRowMuted,
                toggleRowMute: () => toggleRowMute(rowKey),
              }
              const rowId = getRowId?.(row)
              const isExpanded = Boolean(rowId && expandedRowIds?.has(rowId))
              return (
                <Fragment key={rowKey}>
                  <tr
                    className={cn(
                      "border-b hover:bg-muted/50",
                      striped && (rowIdx % 2 === 1 ? "bg-[#F5F5F5]" : "bg-white"),
                      isSelected && "bg-muted/30",
                      isRowMuted && "opacity-50",
                      bodyRowClassName
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className={cn(
                          "px-2 py-1.5 text-[10px] leading-tight sm:px-3 sm:py-2 sm:text-[11px] xl:px-4 xl:py-2.5 xl:text-xs min-[1920px]:px-5 min-[1920px]:py-3 min-[1920px]:text-sm min-[1920px]:leading-normal",
                          cellWrapClass,
                          getAlignClass(col.align),
                          col.className
                        )}
                      >
                        {col.checkbox ? (
                          isStandaloneCheckboxColumn(col) ? (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => onSelectRow?.(row, e.target.checked)}
                              className="size-3.5 shrink-0 rounded border-gray-300 accent-black min-[1920px]:size-4"
                              aria-label="Select row"
                            />
                          ) : (
                            <div className="flex min-w-0 flex-wrap items-center gap-1.5 min-[1920px]:gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => onSelectRow?.(row, e.target.checked)}
                                className="size-3.5 shrink-0 rounded border-gray-300 accent-black min-[1920px]:size-4"
                                aria-label="Select row"
                              />
                              <span className="min-w-0 flex-1">
                                {col.cell ? (
                                  col.cell(row, rowHelpers)
                                ) : (
                                  String((row[col.key as keyof T] ?? "") as string)
                                )}
                              </span>
                            </div>
                          )
                        ) : col.cell ? (
                          <div className="min-w-0">{col.cell(row, rowHelpers)}</div>
                        ) : (
                          String((row[col.key as keyof T] ?? "") as string)
                        )}
                      </td>
                    ))}
                  </tr>
                  {isExpanded && renderExpandedRow ? (
                    <tr className={cn("border-b bg-muted/20", bodyRowClassName)}>
                      <td colSpan={columns.length} className="p-0">
                        {renderExpandedRow(row)}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })
          )}
        </tbody>
      </table>
      </div>
      {pagination ? (
        <div
          className={cn(
            "mt-4 flex items-center px-3 py-2 sm:px-4 sm:py-3",
            pagination.footerClassName
          )}
        >
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            pageSize={pagination.pageSize}
            onPageSizeChange={pagination.onPageSizeChange}
            totalRowCount={pagination.totalRowCount}
            pageSizeOptions={pagination.pageSizeOptions}
            className={pagination.paginationClassName}
          />
        </div>
      ) : null}
    </div>
  )
}
