import { useState, useMemo, useCallback } from "react";

export const DEFAULT_PAGE_SIZE = 10;

export interface UsePaginationOptions {
  totalCount: number;
  pageSize?: number;
  initialPage?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function usePagination({
  totalCount,
  pageSize = DEFAULT_PAGE_SIZE,
  initialPage = 1,
}: UsePaginationOptions): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize]
  );

  const startIndex = useMemo(
    () => (currentPage - 1) * pageSize,
    [currentPage, pageSize]
  );
  const endIndex = useMemo(
    () => Math.min(startIndex + pageSize, totalCount),
    [startIndex, pageSize, totalCount]
  );

  const setPage = useCallback(
    (page: number) => {
      const safe = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(safe);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => setPage(currentPage + 1), [currentPage, setPage]);
  const prevPage = useCallback(() => setPage(currentPage - 1), [currentPage, setPage]);

  return {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    setPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}
