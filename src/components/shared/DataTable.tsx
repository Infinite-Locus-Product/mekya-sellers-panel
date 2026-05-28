"use client"

import { cn } from "@/lib/utils"
import { ReactNode, useCallback, useState } from "react"
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
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string | keyof T
    direction: "asc" | "desc"
  } | null>(null)
  const [mutedRowKeys, setMutedRowKeys] = useState<Set<string | number>>(() => new Set())

  const toggleRowMute = useCallback((key: string | number) => {
    setMutedRowKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const getAlignClass = (align: TableColumn<T>["align"]) => {
    if (align === "center") return "text-center"
    if (align === "right") return "text-right"
    return "text-left"
  }

  const handleSort = (key: string | keyof T) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const sortedData = [...data]
  if (sortConfig) {
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
    const isSorted = sortConfig?.key === col.key
    const sortDirection = isSorted ? sortConfig.direction : null
    const sortState = sortDirection === "asc" ? "asc" : sortDirection === "desc" ? "desc" : "none"

    return (
      <button
        type="button"
        onClick={() => handleSort(col.key)}
        className={cn(
          "inline-flex w-full min-w-0 items-center gap-1 text-[11px] text-foreground transition-colors min-[1920px]:gap-2 min-[1920px]:text-sm",
          "rounded-sm px-0.5 py-0.5 -my-1 min-[1920px]:py-1 hover:bg-black/[0.06] hover:text-foreground",
          col.align === "right" && "justify-end text-right",
          col.align === "center" && "justify-center text-center",
          (col.align === "left" || !col.align) && "justify-start text-left"
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
                  "bg-[#E8E9E8] p-1.5 text-[10px] font-normal leading-tight sm:p-2 sm:text-[11px] xl:p-2.5 xl:text-xs min-[1920px]:p-3 min-[1920px]:text-sm min-[1920px]:leading-normal",
                  cellWrapClass,
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
              return (
                <tr
                  key={rowKey}
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
                        "p-1.5 text-[10px] leading-tight sm:p-2 sm:text-[11px] xl:p-2.5 xl:text-xs min-[1920px]:p-3 min-[1920px]:text-sm min-[1920px]:leading-normal",
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
