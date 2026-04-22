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
}: PaginationProps) {
  const pageSizeId = useId();
  const showPageSize = pageSize !== undefined && onPageSizeChange !== undefined;

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const pageButtons =
    totalPages > 1 ? (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
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
            <span className="px-2 text-sm text-muted-foreground" aria-hidden>
              ...
            </span>
          )}
        </>
      )}
      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-2 text-sm text-muted-foreground" aria-hidden>
              ...
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            aria-label={`Go to page ${totalPages}`}
          >
            {totalPages}
          </Button>
        </>
      )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          &gt;
        </Button>
      </>
    ) : null;

  if (!showPageSize && totalPages <= 1) return null;

  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-center gap-2 min-[1920px]:gap-4",
        showPageSize ? "justify-between" : "justify-center",
        className
      )}
    >
      {showPageSize && (
        <div className="flex min-w-0 shrink-0 items-center gap-1.5 min-[1920px]:gap-2">
          <label
            htmlFor={pageSizeId}
            className="whitespace-nowrap text-[11px] text-muted-foreground min-[1920px]:text-sm"
          >
            Rows per page
          </label>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger id={pageSizeId} size="sm" className="w-[4.25rem]">
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
      {pageButtons && (
        <nav
          className={cn(
            "flex min-w-0 flex-1 flex-wrap items-center gap-1.5 min-[1920px]:gap-2",
            showPageSize ? "justify-end sm:justify-end" : "justify-center"
          )}
          aria-label="Pagination"
        >
          {pageButtons}
        </nav>
      )}
    </div>
  );
}
