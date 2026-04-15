"use client"

import { cn } from "@/lib/utils"
import { ReactNode, useState } from "react"
import { TableSortIcon } from "@/assets/icons/shared"

export type TableColumn<T> = {
  key: keyof T | string
  header: string | ReactNode
  cell?: (row: T) => ReactNode
  align?: "left" | "center" | "right"
  className?: string
  sortable?: boolean
  checkbox?: boolean
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
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string | keyof T
    direction: "asc" | "desc"
  } | null>(null)

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
          "inline-flex w-full min-w-0 items-center gap-2 text-foreground transition-colors",
          "rounded-sm px-0.5 py-1 -my-1 hover:bg-black/[0.06] hover:text-foreground",
          col.align === "right" && "justify-end text-right",
          col.align === "center" && "justify-center text-center",
          (col.align === "left" || !col.align) && "justify-start text-left"
        )}
        aria-label={`Sort by ${String(col.header)} ${sortDirection === "asc" ? "ascending" : sortDirection === "desc" ? "descending" : ""}`.trim()}
      >
        <span className="min-w-0">{col.header}</span>
        <TableSortIcon state={sortState} className="shrink-0" />
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
          className="h-4 w-4 shrink-0 rounded border-gray-300"
          aria-label="Select all rows"
        />
      )

      if (isStandaloneCheckboxColumn(col)) {
        return selectAllCheckbox
      }

      return (
        <div className="flex items-center gap-2">
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  "p-3 font-normal bg-[#E8E9E8]",
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
                className="p-4 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIdx) => {
              const isSelected = selectedRows.has(row)
              return (
                <tr
                  key={getRowKey(row, rowIdx)}
                  className={cn(
                    "border-b hover:bg-muted/50",
                    striped && (rowIdx % 2 === 1 ? "bg-[#F5F5F5]" : "bg-white"),
                    isSelected && "bg-muted/30",
                    bodyRowClassName
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn("p-3 text-sm", getAlignClass(col.align), col.className)}
                    >
                      {col.checkbox ? (
                        isStandaloneCheckboxColumn(col) ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => onSelectRow?.(row, e.target.checked)}
                            className="h-4 w-4 shrink-0 rounded border-gray-300"
                            aria-label="Select row"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => onSelectRow?.(row, e.target.checked)}
                              className="h-4 w-4 shrink-0 rounded border-gray-300"
                              aria-label="Select row"
                            />
                            {col.cell ? (
                              col.cell(row)
                            ) : (
                              String((row[col.key as keyof T] ?? "") as string)
                            )}
                          </div>
                        )
                      ) : col.cell ? (
                        col.cell(row)
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
  )
}
