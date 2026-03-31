import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePagination } from "./usePagination";

describe("usePagination", () => {
  it("computes totalPages from totalCount and pageSize", () => {
    const { result } = renderHook(() =>
      usePagination({ totalCount: 25, pageSize: 10 })
    );
    expect(result.current.totalPages).toBe(3);
  });

  it("starts at page 1", () => {
    const { result } = renderHook(() =>
      usePagination({ totalCount: 100, pageSize: 10 })
    );
    expect(result.current.currentPage).toBe(1);
  });

  it("setPage updates currentPage within bounds", () => {
    const { result } = renderHook(() =>
      usePagination({ totalCount: 30, pageSize: 10 })
    );
    act(() => result.current.setPage(2));
    expect(result.current.currentPage).toBe(2);
    act(() => result.current.setPage(10));
    expect(result.current.currentPage).toBe(3);
  });

  it("nextPage and prevPage update page", () => {
    const { result } = renderHook(() =>
      usePagination({ totalCount: 50, pageSize: 10 })
    );
    act(() => result.current.nextPage());
    expect(result.current.currentPage).toBe(2);
    act(() => result.current.prevPage());
    expect(result.current.currentPage).toBe(1);
  });

  it("startIndex and endIndex are correct for page 2", () => {
    const { result } = renderHook(() =>
      usePagination({ totalCount: 25, pageSize: 10 })
    );
    act(() => result.current.setPage(2));
    expect(result.current.startIndex).toBe(10);
    expect(result.current.endIndex).toBe(20);
  });
});
