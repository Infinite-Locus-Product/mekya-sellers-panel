"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getPaginationRange, PAGINATION_WINDOW_SIZE } from "@/lib/paginationRange";

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50] as const;

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
  className?: string;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  /** Filtered table row count (optional; passed through for future use, does not hide the bar). */
  totalRowCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
  className,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  totalRowCount,
}: PaginationProps) {
  const pageSizeId = useId();
  const showPageSize = pageSize !== undefined && onPageSizeChange !== undefined;

  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

  // Page 1 and the last page are always pinned, with a 3-page sliding window between them.
  // `maxVisible` is honoured as the window size for callers that set it explicitly.
  const slots = getPaginationRange(
    safeCurrentPage,
    safeTotalPages,
    maxVisible === 5 ? PAGINATION_WINDOW_SIZE : maxVisible
  );

  const pageButtons =
    safeTotalPages > 1 ? (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          aria-label="Previous page"
        >
          &lt;
        </Button>
        {slots.map((slot, index) =>
          slot === "ellipsis" ? (
            <span
              // Index is a stable key here: slot lists are regenerated wholesale on every
              // page change and never reordered in place.
              key={`gap-${index}`}
              className="inline-flex h-8 items-center px-2 text-sm text-muted-foreground"
              aria-hidden
            >
              ...
            </span>
          ) : (
            <Button
              key={slot}
              variant={slot === safeCurrentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(slot)}
              aria-label={`Page ${slot}`}
              aria-current={slot === safeCurrentPage ? "page" : undefined}
            >
              {slot}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= safeTotalPages}
          aria-label="Next page"
        >
          &gt;
        </Button>
      </>
    ) : (
      <>
        <Button variant="outline" size="sm" disabled aria-label="Previous page">
          &lt;
        </Button>
        <Button variant="default" size="sm" aria-label="Page 1" aria-current="page">
          1
        </Button>
        <Button variant="outline" size="sm" disabled aria-label="Next page">
          &gt;
        </Button>
      </>
    );

  return (
    <div
      className={cn(
        "flex w-full flex-wrap content-center items-center gap-2 min-[1920px]:gap-4",
        showPageSize ? "justify-between" : "justify-center",
        className
      )}
      {...(totalRowCount === undefined
        ? {}
        : { "data-total-row-count": String(totalRowCount) })}
    >
      {showPageSize && (
        <div className="flex min-w-0 shrink-0 items-center gap-1.5 min-[1920px]:gap-2">
          <label
            htmlFor={pageSizeId}
            className="inline-flex h-8 shrink-0 items-center whitespace-nowrap text-[11px] leading-none text-muted-foreground min-[1920px]:text-sm"
          >
            Rows per page
          </label>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger
              id={pageSizeId}
              size="sm"
              className="h-8 w-[4.25rem] shrink-0 px-2 py-0 text-xs leading-none min-[1920px]:text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              {pageSizeOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <nav
        className={cn(
          "flex min-w-0 flex-1 flex-wrap content-center items-center gap-1.5 min-[1920px]:gap-2",
          showPageSize ? "justify-end sm:justify-end" : "justify-center"
        )}
        aria-label="Pagination"
      >
        {pageButtons}
      </nav>
    </div>
  );
}
