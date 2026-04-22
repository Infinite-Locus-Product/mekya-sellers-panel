import { useState, useMemo, useCallback, useEffect } from "react";

const DEFAULT_PAGE_SIZE = 10;

export interface UsePaginationOptions {
  totalCount: number;
  /** Initial rows per page; becomes state when `setPageSize` is used from the hook return. */
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
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function usePagination({
  totalCount,
  pageSize: initialPageSize = DEFAULT_PAGE_SIZE,
  initialPage = 1,
}: UsePaginationOptions): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize]
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

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

  const setPageSize = useCallback((size: number) => {
    const safe = Math.max(1, Math.floor(Number(size)) || 1);
    setPageSizeState(safe);
    setCurrentPage(1);
  }, []);

  const nextPage = useCallback(() => setPage(currentPage + 1), [currentPage, setPage]);
  const prevPage = useCallback(() => setPage(currentPage - 1), [currentPage, setPage]);

  return {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}
