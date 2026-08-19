"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileText, Loader2, Plus, RotateCcw, Search } from "lucide-react";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";
import { InventoryTypeBadge } from "@/components/shared/InventoryTypeBadge";
import {
  PRODUCT_INVENTORY_TYPE_LABELS,
  SELECTABLE_PRODUCT_INVENTORY_TYPES,
  TABLE_BADGE_PILL_COLUMN_CLASS,
  TABLE_CHANNEL_COLUMN_CLASS,
  TABLE_LISTING_STATUS_COLUMN_CLASS,
  type ProductRow,
} from "@/lib/tableTypes";
import { AppSelect } from "@/components/shared/AppSelect";
import { MultiSelectFilter } from "@/components/shared/MultiSelectFilter";
import { StatusToggle } from "@/components/shared/StatusToggle";
import { useServerTableSort } from "@/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  deleteProduct,
  getCategories,
  listProducts,
  publishProduct,
  toProductRow,
  unpublishProduct,
  type Category,
  type ProductChannel,
  type ProductSortField,
} from "@/lib/api/products";

type PageSlice = {
  products: ProductRow[];
  nextCursor: string | null;
  hasNext: boolean;
};

type FetchPageParams = {
  channels?: ProductChannel[];
  status?: string;
  sortBy: ProductSortField;
  sortOrder: "ASC" | "DESC";
  pageSize: number;
  categoryIds?: string[];
  cursor?: string;
  search?: string;
  inventoryTypes?: string[];
};

/** The backend fetches a fixed-size batch from Saleor, then filters it by
 * channel/status/inventory_type in Python — a single batch
 * can come back with fewer rows than `pageSize` even though Saleor's own
 * cursor says more data exists. Left alone, that surfaces as a near-empty
 * "extra page." Keep pulling subsequent cursor batches and merging until we
 * have a full page's worth or the backend genuinely runs out — never fewer
 * rows than are actually available just because one raw batch happened to
 * be sparse after filtering. Every filter/search control on this page must
 * be passed through here (not applied afterward in React state) so it
 * participates in this same fetch-until-full loop instead of shrinking an
 * already-fetched page. */
export async function fetchFullPage(params: FetchPageParams): Promise<PageSlice> {
  const merged: ProductRow[] = [];
  let cursor = params.cursor;
  let hasNext = true;
  const MAX_FETCHES = 20; // safety cap against a pathological all-filtered-out backend response
  for (let i = 0; i < MAX_FETCHES && merged.length < params.pageSize && hasNext; i++) {
    // Request only what's still needed, not always a full pageSize — the
    // backend's `limit` caps its raw pre-filter fetch, so this guarantees
    // `merged` can never grow past pageSize even when a batch comes back
    // less-filtered than expected. Without this, a page could render more
    // rows than the selected page size.
    const res = await listProducts({
      channels: params.channels,
      status: params.status,
      sort_by: params.sortBy,
      sort_order: params.sortOrder,
      limit: params.pageSize - merged.length,
      category_ids: params.categoryIds,
      cursor,
      search: params.search,
      inventory_types: params.inventoryTypes,
    });
    merged.push(...res.products.map(toProductRow));
    hasNext = res.has_next;
    cursor = res.cursor ?? undefined;
    if (res.products.length === 0 && !hasNext) break;
  }
  return { products: merged, nextCursor: hasNext ? (cursor ?? null) : null, hasNext };
}

export function ProductListingClient() {
  const router = useRouter();

  // ── Pagination stack ──────────────────────────────────────────────────────
  const [stack, setStack] = useState<PageSlice[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const fetchGenRef = useRef(0);

  // ── Categories (fetched once for the filter dropdown) ─────────────────────
  const [categories, setCategories] = useState<Category[]>([]);

  // ── Filters (all backend-driven — folded into the fetch-until-full loop) ───
  const [searchInput, setSearchInput] = useState("");
  const [listingStatus, setListingStatus] = useState("all");
  /**
   * Multi-select. An empty selection sends no `channel` query param, so the listing shows
   * everything; each picked value maps straight to a backend `channel` value and they're
   * sent as repeated params. Note "both" is its own assignment, not the union of the other
   * two: it means products listed on B2C *and* B2B, so the three options are disjoint and
   * selecting several returns exactly their union.
   */
  const [channelFilter, setChannelFilter] = useState<ProductChannel[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedInventoryTypes, setSelectedInventoryTypes] = useState<string[]>([]);

  // Debounce search so the listing doesn't refetch the backend on every keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [productToDelete, setProductToDelete] = useState<ProductRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toggleLoadingIds, setToggleLoadingIds] = useState<Set<string>>(new Set());

  // ── Server sort ────────────────────────────────────────────────────────────
  const { sortBy, sortOrder, serverSortKey, serverSortDirection, handleServerSortColumn } =
    useServerTableSort(
      [
        { columnKey: "name", sortField: "NAME", initialOrder: "ASC" },
        { columnKey: "price", sortField: "PRICE", initialOrder: "ASC" },
      ],
      { sortBy: "DATE", sortOrder: "DESC" },
    );

  // ── Categories load (once) ─────────────────────────────────────────────────
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // ── Main fetch — resets to page 1 on any backend filter/search change ──────
  useEffect(() => {
    const gen = ++fetchGenRef.current;
    setIsLoading(true);
    fetchFullPage({
      channels: channelFilter.length > 0 ? channelFilter : undefined,
      status: listingStatus !== "all" ? listingStatus : undefined,
      sortBy: sortBy as ProductSortField,
      sortOrder,
      pageSize,
      categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      search: debouncedSearch || undefined,
      inventoryTypes: selectedInventoryTypes.length > 0 ? selectedInventoryTypes : undefined,
    })
      .then((slice) => {
        if (gen !== fetchGenRef.current) return;
        setStack([slice]);
        setPageIndex(0);
      })
      .catch(() => toast.error("Failed to load products. Please refresh the page."))
      .finally(() => {
        if (gen === fetchGenRef.current) setIsLoading(false);
      });
  }, [
    listingStatus,
    sortBy,
    sortOrder,
    pageSize,
    selectedCategoryIds,
    debouncedSearch,
    channelFilter,
    selectedInventoryTypes,
  ]);

  // ── Pagination helpers ─────────────────────────────────────────────────────
  const currentSlice = stack[pageIndex];

  const goNextPage = useCallback(async () => {
    if (isLoading) return;
    // Already have it cached
    if (pageIndex < stack.length - 1) {
      setPageIndex((p) => p + 1);
      return;
    }
    const slice = stack[pageIndex];
    if (!slice?.hasNext || !slice.nextCursor) return;

    const gen = ++fetchGenRef.current;
    setIsLoading(true);
    try {
      const newSlice = await fetchFullPage({
        channels: channelFilter.length > 0 ? channelFilter : undefined,
        status: listingStatus !== "all" ? listingStatus : undefined,
        sortBy: sortBy as ProductSortField,
        sortOrder,
        pageSize,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        cursor: slice.nextCursor,
        search: debouncedSearch || undefined,
        inventoryTypes: selectedInventoryTypes.length > 0 ? selectedInventoryTypes : undefined,
      });
      if (gen !== fetchGenRef.current) return;
      setStack((prev) => [...prev, newSlice]);
      setPageIndex(stack.length);
    } catch {
      toast.error("Failed to load next page. Please try again.");
    } finally {
      if (gen === fetchGenRef.current) setIsLoading(false);
    }
  }, [
    isLoading,
    pageIndex,
    stack,
    channelFilter,
    listingStatus,
    sortBy,
    sortOrder,
    pageSize,
    selectedCategoryIds,
    debouncedSearch,
    selectedInventoryTypes,
  ]);

  const goToPage = useCallback(
    (page: number) => {
      const idx = page - 1;
      if (idx >= 0 && idx < stack.length) {
        setPageIndex(idx);
      } else if (idx === stack.length && (stack[pageIndex]?.hasNext ?? false)) {
        void goNextPage();
      }
    },
    [stack, pageIndex, goNextPage],
  );

  // ── Category options ───────────────────────────────────────────────────────
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ label: c.name, value: c.id })),
    [categories],
  );

  // ── Display products: search/channel/inventory-type are all backend
  // filters now (folded into fetchFullPage above), so the current cursor
  // page's products are exactly what should render — no further filtering. ─
  const displayProducts = currentSlice?.products ?? [];

  // ── Status toggle ─────────────────────────────────────────────────────────
  const handleListingToggle = (row: ProductRow, newStatus: "active" | "inactive") => {
    // Update across all cached slices so the change is visible on every loaded page
    setStack((prev) =>
      prev.map((slice) => ({
        ...slice,
        products: slice.products.map((p) =>
          p.id === row.id ? { ...p, status: newStatus } : p,
        ),
      })),
    );
    setToggleLoadingIds((prev) => new Set([...prev, row.id]));
    const apiCall = newStatus === "active" ? publishProduct(row.id) : unpublishProduct(row.id);
    apiCall
      .then(() => {
        toast.success(
          newStatus === "active"
            ? "Product marked as Active successfully."
            : "Product marked as Inactive successfully.",
        );
      })
      .catch((err: unknown) => {
        setStack((prev) =>
          prev.map((slice) => ({
            ...slice,
            products: slice.products.map((p) =>
              p.id === row.id ? { ...p, status: row.status } : p,
            ),
          })),
        );
        toast.error(err instanceof Error ? err.message : "Failed to update product status.");
      })
      .finally(() => {
        setToggleLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(row.id);
          return next;
        });
      });
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleConfirmDelete = () => {
    if (!productToDelete || isDeleting) return;
    const deleted = productToDelete;
    // Find which cached slice contains this product
    const deletedSliceIndex = stack.findIndex((s) => s.products.some((p) => p.id === deleted.id));
    const deletedProductIndex =
      deletedSliceIndex >= 0
        ? stack[deletedSliceIndex].products.findIndex((p) => p.id === deleted.id)
        : -1;
    setIsDeleting(true);
    setStack((prev) =>
      prev.map((slice) => ({
        ...slice,
        products: slice.products.filter((p) => p.id !== deleted.id),
      })),
    );
    deleteProduct(deleted.id)
      .then(() => {
        try {
          localStorage.removeItem(`mekya_seller_draft_${deleted.id}`);
        } catch { /* ignore */ }
        toast.success("Product deleted successfully.");
        setProductToDelete(null);
      })
      .catch((err: unknown) => {
        setStack((prev) =>
          prev.map((slice, idx) => {
            if (idx !== deletedSliceIndex) return slice;
            const prods = [...slice.products];
            prods.splice(Math.min(deletedProductIndex, prods.length), 0, deleted);
            return { ...slice, products: prods };
          }),
        );
        toast.error(err instanceof Error ? err.message : "Failed to delete product.");
        setProductToDelete(null);
      })
      .finally(() => setIsDeleting(false));
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSelectedCategoryIds([]);
    setListingStatus("all");
    setChannelFilter([]);
    setSelectedInventoryTypes([]);
    setSearchInput("");
  };

  /**
   * Percentages for the text/action columns; the badge columns instead use the definite rem
   * widths of the `TABLE_*_COLUMN_CLASS` constants so their pills stay content-sized.
   *
   * Tuned so the two together leave only a few percent of slack: `table-fixed` spreads any
   * shortfall proportionally across every column, so a large shortfall is what stretches the
   * badge pills — and giving one column no width at all makes it swallow the whole surplus.
   */
  const colWidth = {
    name: "w-[24%]",
    articleNumber: "w-[17%]",
    category: "w-[15%]",
    price: "w-[7%]",
    toggle: "w-[8%]",
    actions: "w-[10%]",
  };

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: TableColumn<ProductRow>[] = [
    {
      key: "name",
      header: "Product Name",
      sortable: true,
      className: colWidth.name,
      cell: (row) => (
        <span className="line-clamp-2 break-words" title={row.name}>
          {row.name}
        </span>
      ),
    },
    { key: "articleNumber", header: "Article Number", className: colWidth.articleNumber },
    { key: "category", header: "Category", className: colWidth.category },
    {
      key: "inventoryType",
      header: "Inventory Type",
      align: "center" as const,
      className: TABLE_BADGE_PILL_COLUMN_CLASS,
      cell: (row) => <InventoryTypeBadge type={row.inventoryType} />,
    },
    {
      key: "channels",
      header: "Channel",
      align: "center" as const,
      className: TABLE_CHANNEL_COLUMN_CLASS,
      cell: (row: ProductRow) => {
        const ch = row.channels ?? "both";
        const cfg = {
          b2c: { label: "B2C", cls: "bg-blue-100 text-blue-700" },
          b2b: { label: "B2B", cls: "bg-purple-100 text-purple-700" },
          both: { label: "B2C & B2B", cls: "bg-green-100 text-green-700" },
        } as const;
        return (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-[11px] xl:text-xs min-[1920px]:text-sm ${cfg[ch].cls}`}
          >
            {cfg[ch].label}
          </span>
        );
      },
    },
    { key: "price", header: "Price", sortable: true, className: colWidth.price },
    {
      key: "status",
      header: "Status",
      align: "center" as const,
      className: TABLE_LISTING_STATUS_COLUMN_CLASS,
      cell: (row) => {
        const pill =
          "inline-flex h-[22px] w-full min-w-0 max-w-full items-center justify-center whitespace-nowrap rounded-full px-1 py-0.5 text-center text-[9px] font-medium leading-none sm:h-7 sm:px-2 sm:text-[11px] min-[1920px]:h-8 min-[1920px]:text-sm";
        return row.status === "active" ? (
          <span className={`${pill} bg-[#DCFCE7] text-[#166534]`}>Active</span>
        ) : (
          <span className={`${pill} bg-[#E5E7EB] text-[#374151]`}>In-active</span>
        );
      },
    },
    {
      key: "toggle",
      header: "Status Switch",
      align: "center",
      className: colWidth.toggle,
      cell: (row) => (
        <StatusToggle
          status={row.status}
          isLoading={toggleLoadingIds.has(row.id)}
          onToggle={(newStatus) => handleListingToggle(row, newStatus)}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      className: colWidth.actions,
      cell: (row) => (
        <div className="flex items-center justify-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            aria-label={`View ${row.name}`}
            onClick={() => router.push(`/product-listing/${encodeURIComponent(row.id)}`)}
            title="View product details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={`Edit ${row.name}`}
            onClick={() =>
              router.push(
                `/product-listing/add-product?productId=${encodeURIComponent(row.id)}`,
              )
            }
            title="Edit product"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.475 5.40783L18.592 7.52483M17.836 3.54283L12.109 9.26983C11.8122 9.56467 11.6102 9.94144 11.529 10.3518L11 12.9998L13.648 12.4698C14.058 12.3878 14.434 12.1868 14.73 11.8908L20.457 6.16383C20.6291 5.99173 20.7656 5.78742 20.8588 5.56256C20.9519 5.33771 20.9998 5.09671 20.9998 4.85333C20.9998 4.60994 20.9519 4.36895 20.8588 4.14409C20.7656 3.91923 20.6291 3.71492 20.457 3.54283C20.2849 3.37073 20.0806 3.23421 19.8557 3.14108C19.6309 3.04794 19.3899 3 19.1465 3C18.9031 3 18.6621 3.04794 18.4373 3.14108C18.2124 3.23421 18.0081 3.37073 17.836 3.54283Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 15V18C19 18.5304 18.7893 19.0391 18.4142 19.4142C18.0391 19.7893 17.5304 20 17 20H6C5.46957 20 4.96086 19.7893 4.58579 19.4142C4.21071 19.0391 4 18.5304 4 18V7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            aria-label={`Delete ${row.name}`}
            onClick={() => setProductToDelete(row)}
            title="Delete product"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.76953 5.48953H22.2295M9.90703 17.347V10.372M14.092 17.347V10.372M14.092 1.76953H9.90703C9.53705 1.76953 9.18223 1.9165 8.92062 2.17812C8.659 2.43973 8.51203 2.79455 8.51203 3.16453V5.48953H15.487V3.16453C15.487 2.79455 15.3401 2.43973 15.0784 2.17812C14.8168 1.9165 14.462 1.76953 14.092 1.76953ZM18.3793 20.9461C18.3535 21.2956 18.1961 21.6223 17.939 21.8605C17.6819 22.0986 17.3441 22.2305 16.9936 22.2295H7.00543C6.65498 22.2305 6.31718 22.0986 6.06006 21.8605C5.80294 21.6223 5.6456 21.2956 5.61973 20.9461L4.32703 5.48953H19.672L18.3793 20.9461Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  // ── Cursor pagination props ─────────────────────────────────────────────────
  const cursorTotalPages = Math.max(1, stack.length + (currentSlice?.hasNext ? 1 : 0));

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
          Seller Dashboard &gt; Product Listing
        </nav>
        <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-foreground">Product Listing</h1>
          <Link
            href="/product-listing/add-product"
            className={cn(buttonVariants({ variant: "default", size: "lg" }))}
          >
            <Plus className="h-4 w-4" aria-hidden />
            <span className="ml-2">Add New Product</span>
          </Link>
        </div>
        <p className="text-gray-700">
          Manage your B2C and B2B products
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-5 w-5 shrink-0" aria-hidden />
            Listed Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter bar */}
          <div className="mb-4 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
            {/* Search */}
            <div className="relative min-w-0 w-full shrink-0 lg:max-w-md">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search Products"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-md border border-input bg-[#E8E9E8] px-10 py-2 text-md focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Search products"
              />
            </div>

            {/* Filters row */}
            <div className="flex min-w-0 w-full flex-nowrap items-center gap-1 overflow-hidden sm:gap-1.5 min-[1920px]:gap-3">
              {/* Category — backend filter */}
              <MultiSelectFilter
                placeholder="All Categories"
                options={categoryOptions}
                selected={selectedCategoryIds}
                onChange={setSelectedCategoryIds}
              />

              {/* Status — backend filter */}
              <AppSelect
                placeholder="All Status"
                value={listingStatus}
                onChange={(value: string) => setListingStatus(value)}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "In-active", value: "inactive" },
                ]}
                className="h-7 min-w-0 flex-1 basis-0 !w-full max-w-full overflow-hidden px-1.5 text-[10px] sm:h-8 sm:text-xs min-[1920px]:h-10 min-[1920px]:px-3 min-[1920px]:text-sm [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-left"
              />

              {/* Channel — backend filter; selecting none sends no `channel` param.
                  "Both" is a distinct, real product state (listed on B2C and B2B
                  simultaneously), and the three values are disjoint, so a
                  multi-selection returns exactly their union. */}
              <MultiSelectFilter
                placeholder="All Channels"
                options={[
                  { label: "B2C", value: "b2c" },
                  { label: "B2B", value: "b2b" },
                  { label: "B2C & B2B", value: "both" },
                ]}
                selected={channelFilter}
                onChange={(values) => setChannelFilter(values as ProductChannel[])}
              />

              {/* Inventory type — backend filter (folded into the fetch-until-full
                  loop). "sale_or_return" is intentionally excluded from the offered
                  choices (see #16); it remains a valid, displayable value for any
                  pre-existing product still tagged with it (PRODUCT_INVENTORY_TYPE_LABELS
                  keeps the label so those rows still render correctly). */}
              <MultiSelectFilter
                placeholder="All Inventory Types"
                options={SELECTABLE_PRODUCT_INVENTORY_TYPES.map((value) => ({
                  label: PRODUCT_INVENTORY_TYPE_LABELS[value],
                  value,
                }))}
                selected={selectedInventoryTypes}
                onChange={setSelectedInventoryTypes}
              />

              {/* Reset */}
              <button
                type="button"
                onClick={handleReset}
                className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground sm:text-xs min-[1920px]:text-sm"
                aria-label="Reset all filters"
              >
                <RotateCcw className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
                Reset
              </button>
            </div>
          </div>

          {/* Table */}
          {isLoading && stack.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">Loading products…</p>
            </div>
          ) : (
            /* Refetches triggered by a filter, sort or page change keep the previous rows
             * mounted under this overlay — replacing the table outright would collapse the
             * card and drop the pagination controls on every filter change. */
            <div className="relative">
              {isLoading && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center rounded-md bg-white/75"
                  role="status"
                  aria-live="polite"
                >
                  <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" aria-hidden />
                    Loading products…
                  </span>
                </div>
              )}
              <div aria-busy={isLoading} className={cn(isLoading && "pointer-events-none")}>
                <DataTable
                  columns={columns}
                  data={displayProducts}
                  striped
                  emptyMessage={
                    isLoading ? "Loading…" : "No products match your filters"
                  }
                  onServerSortColumn={handleServerSortColumn}
                  serverSortKey={serverSortKey}
                  serverSortDirection={serverSortDirection}
                  pagination={{
                    currentPage: pageIndex + 1,
                    totalPages: cursorTotalPages,
                    onPageChange: goToPage,
                    pageSize,
                    onPageSizeChange: setPageSize,
                    totalRowCount: displayProducts.length,
                    pageSizeOptions: [10, 20, 50] as const,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <DialogContent className="max-w-[min(100%,22rem)] border-0 bg-white p-8 shadow-lg sm:max-w-md">
          <div className="flex flex-col items-center text-center">
            <span className="my-6">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_3813_107021)">
                  <path
                    d="M9.76922 55.0172C6.7129 52.0653 4.27507 48.5343 2.59798 44.6302C0.92089 40.726 0.0381303 36.527 0.00120822 32.2781C-0.0357139 28.0291 0.773941 23.8154 2.38293 19.8827C3.99192 15.95 6.36802 12.3771 9.37258 9.37258C12.3771 6.36802 15.95 3.99192 19.8827 2.38293C23.8154 0.773941 28.0291 -0.0357139 32.2781 0.00120822C36.527 0.0381303 40.726 0.92089 44.6302 2.59798C48.5343 4.27507 52.0653 6.7129 55.0172 9.76922C60.8463 15.8045 64.0717 23.8878 63.9988 32.2781C63.9259 40.6684 60.5605 48.6944 54.6274 54.6274C48.6944 60.5605 40.6684 63.9259 32.2781 63.9988C23.8878 64.0717 15.8045 60.8463 9.76922 55.0172ZM50.5052 50.5052C55.3088 45.7016 58.0075 39.1865 58.0075 32.3932C58.0075 25.5999 55.3088 19.0848 50.5052 14.2812C45.7016 9.47762 39.1865 6.77899 32.3932 6.77899C25.5999 6.77899 19.0848 9.47762 14.2812 14.2812C9.47762 19.0848 6.77899 25.5999 6.77899 32.3932C6.77899 39.1865 9.47762 45.7016 14.2812 50.5052C19.0848 55.3088 25.5999 58.0075 32.3932 58.0075C39.1865 58.0075 45.7016 55.3088 50.5052 50.5052ZM29.1932 16.3932H35.5932V35.5932H29.1932V16.3932ZM29.1932 41.9932H35.5932V48.3932H29.1932V41.9932Z"
                    fill="#962C2C"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_3813_107021">
                    <rect width="64" height="64" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>
            <h2 className="mb-2 mt-4 text-lg font-semibold text-foreground">
              Are you sure you want to delete this product?
            </h2>
            <p className="mb-8 text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
            <div className="flex w-full gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 rounded-md border-foreground/20 bg-white font-medium text-foreground hover:bg-muted/50"
                onClick={() => setProductToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isDeleting}
                className="h-11 flex-1 rounded-md bg-[#122130] font-medium text-white hover:bg-[#0d1a28]"
                onClick={handleConfirmDelete}
              >
                {isDeleting ? (
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                ) : null}
                {isDeleting ? "Deleting…" : "Yes! Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
