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

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, safeCurrentPage - half);
  const end = Math.min(safeTotalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

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
        {start > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              aria-label="Go to page 1"
            >
              1
            </Button>
            {start > 2 && (
              <span
                className="inline-flex h-8 items-center px-2 text-sm text-muted-foreground"
                aria-hidden
              >
                ...
              </span>
            )}
          </>
        )}
        {pages.map((page) => (
          <Button
            key={page}
            variant={page === safeCurrentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === safeCurrentPage ? "page" : undefined}
          >
            {page}
          </Button>
        ))}
        {end < safeTotalPages && (
          <>
            {end < safeTotalPages - 1 && (
              <span
                className="inline-flex h-8 items-center px-2 text-sm text-muted-foreground"
                aria-hidden
              >
                ...
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(safeTotalPages)}
              aria-label={`Go to page ${safeTotalPages}`}
            >
              {safeTotalPages}
            </Button>
          </>
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
