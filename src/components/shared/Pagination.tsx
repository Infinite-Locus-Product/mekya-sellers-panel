"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Max page buttons to show (excluding prev/next). Default 5. */
  maxVisible?: number;
  className?: string;
}

/**
 * Data-driven pagination. Use with usePagination or similar.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

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

  return (
    <div
      className={cn("flex items-center justify-center gap-2", className)}
      role="navigation"
      aria-label="Pagination"
    >
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
    </div>
  );
}
