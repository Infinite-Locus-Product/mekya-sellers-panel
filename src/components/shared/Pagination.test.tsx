import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "./Pagination";

afterEach(() => {
  cleanup();
});

describe("Pagination", () => {
  it("renders pagination bar when totalPages is 1 (single page, nav disabled)", () => {
    render(
      <Pagination currentPage={1} totalPages={1} onPageChange={() => { }} />
    );
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
  });

  it("renders previous and next buttons and page buttons when totalPages > 1", () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => { }} />
    );
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
  });

  it("calls onPageChange when a page button is clicked", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
    );
    const page2 = screen.getByRole("button", { name: "Page 2" });
    fireEvent.click(page2);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("disables previous on first page and next on last page", () => {
    render(
      <Pagination currentPage={1} totalPages={3} onPageChange={() => { }} />
    );
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    const next = screen.getByRole("button", { name: "Next page" });
    expect(next).not.toBeDisabled();
  });

  it("shows rows-per-page alongside page controls when totalRowCount is set", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={2}
        onPageChange={() => {}}
        pageSize={5}
        onPageSizeChange={() => {}}
        totalRowCount={5}
      />
    );
    expect(screen.getByText("Rows per page")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Rows per page" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
  });

  it("still shows rows-per-page and pagination when row count is below 5", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={() => {}}
        pageSize={5}
        onPageSizeChange={() => {}}
        totalRowCount={4}
      />
    );
    expect(screen.getByText("Rows per page")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
  });
});
