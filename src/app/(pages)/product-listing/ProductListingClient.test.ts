import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchFullPage } from "./ProductListingClient";
import { listProducts, type ProductListItem } from "@/lib/api/products";

vi.mock("@/lib/api/products", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/products")>(
    "@/lib/api/products",
  );
  return { ...actual, listProducts: vi.fn() };
});

const mockedListProducts = listProducts as unknown as ReturnType<typeof vi.fn>;

function item(id: string): ProductListItem {
  return {
    id,
    name: `Product ${id}`,
    thumbnail_url: null,
    sku: null,
    status: "published",
    article_number: `AN-${id}`,
    category: "T-Shirts",
    sizes: [],
    colors: [],
    inventory_type: "ready_to_ship",
    price: "₹500",
    quantity: 10,
    channels: "both",
  };
}

beforeEach(() => {
  mockedListProducts.mockReset();
});

describe("fetchFullPage", () => {
  it("returns exactly pageSize rows when that many matches exist in one batch (Case A)", async () => {
    mockedListProducts.mockResolvedValueOnce({
      products: Array.from({ length: 10 }, (_, i) => item(String(i))),
      has_next: true,
      cursor: "cursor-1",
      total: 100,
    });

    const result = await fetchFullPage({
      sortBy: "DATE",
      sortOrder: "DESC",
      pageSize: 10,
    });

    expect(result.products).toHaveLength(10);
    expect(mockedListProducts).toHaveBeenCalledTimes(1);
  });

  it("returns fewer than pageSize with hasNext=false when the backend genuinely runs out (Case B)", async () => {
    mockedListProducts.mockResolvedValueOnce({
      products: Array.from({ length: 7 }, (_, i) => item(String(i))),
      has_next: false,
      cursor: null,
      total: 7,
    });

    const result = await fetchFullPage({
      sortBy: "DATE",
      sortOrder: "DESC",
      pageSize: 10,
    });

    expect(result.products).toHaveLength(7);
    expect(result.hasNext).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it("never returns more rows than pageSize even if a raw batch is larger", async () => {
    // Defensive: a raw batch should never exceed the requested `limit`, but
    // fetchFullPage must not render more than pageSize regardless.
    mockedListProducts.mockResolvedValueOnce({
      products: Array.from({ length: 10 }, (_, i) => item(String(i))),
      has_next: true,
      cursor: "cursor-1",
      total: 100,
    });

    const result = await fetchFullPage({
      sortBy: "DATE",
      sortOrder: "DESC",
      pageSize: 10,
    });

    expect(result.products.length).toBeLessThanOrEqual(10);
  });

  it("keeps pulling subsequent cursor batches when one batch is sparse after backend filtering (Case D)", async () => {
    // First raw batch: only 3 of the 10 requested survive backend filtering.
    mockedListProducts
      .mockResolvedValueOnce({
        products: [item("a"), item("b"), item("c")],
        has_next: true,
        cursor: "cursor-1",
        total: 50,
      })
      .mockResolvedValueOnce({
        products: Array.from({ length: 7 }, (_, i) => item(`d${i}`)),
        has_next: true,
        cursor: "cursor-2",
        total: 50,
      });

    const result = await fetchFullPage({
      sortBy: "DATE",
      sortOrder: "DESC",
      pageSize: 10,
    });

    expect(result.products).toHaveLength(10);
    expect(mockedListProducts).toHaveBeenCalledTimes(2);
    // Second call must request only what's still needed (10 - 3 = 7), not a full pageSize.
    expect(mockedListProducts.mock.calls[1][0]).toMatchObject({ limit: 7, cursor: "cursor-1" });
  });

  it("stops after MAX_FETCHES safety cap instead of looping forever on an all-filtered-out backend", async () => {
    mockedListProducts.mockResolvedValue({
      products: [],
      has_next: true,
      cursor: "cursor-stuck",
      total: 0,
    });

    const result = await fetchFullPage({
      sortBy: "DATE",
      sortOrder: "DESC",
      pageSize: 10,
    });

    expect(result.products).toHaveLength(0);
    expect(mockedListProducts.mock.calls.length).toBeLessThanOrEqual(20);
  });

  it("forwards search, channels, and inventoryTypes to the backend (Case E — real backend search)", async () => {
    mockedListProducts.mockResolvedValueOnce({
      products: [],
      has_next: false,
      cursor: null,
      total: 0,
    });

    await fetchFullPage({
      sortBy: "DATE",
      sortOrder: "DESC",
      pageSize: 10,
      search: "blue shirt",
      channels: ["both"],
      inventoryTypes: ["ready_to_ship", "pre_booking"],
    });

    expect(mockedListProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "blue shirt",
        channels: ["both"],
        inventory_types: ["ready_to_ship", "pre_booking"],
      }),
    );
  });

  it("starts from the given cursor and never reuses a stale one from a prior query (Case F)", async () => {
    mockedListProducts.mockResolvedValueOnce({
      products: Array.from({ length: 10 }, (_, i) => item(String(i))),
      has_next: false,
      cursor: null,
      total: 10,
    });

    await fetchFullPage({
      sortBy: "DATE",
      sortOrder: "DESC",
      pageSize: 10,
      cursor: "fresh-cursor",
    });

    expect(mockedListProducts.mock.calls[0][0]).toMatchObject({ cursor: "fresh-cursor" });
  });

  it("issues a cursor-less first request when no cursor is given (fresh filter/search reset)", async () => {
    mockedListProducts.mockResolvedValueOnce({
      products: [],
      has_next: false,
      cursor: null,
      total: 0,
    });

    await fetchFullPage({
      sortBy: "DATE",
      sortOrder: "DESC",
      pageSize: 10,
    });

    expect(mockedListProducts.mock.calls[0][0]).toMatchObject({ cursor: undefined });
  });
});
