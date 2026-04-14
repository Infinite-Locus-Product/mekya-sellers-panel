"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, FileText, Plus, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";
import { PRODUCT_INVENTORY_TYPE_LABELS, type ProductRow } from "@/lib/tableTypes";
import { AppSelect } from "@/components/shared/AppSelect";
import { StatusToggle } from "@/components/shared/StatusToggle";
import { Pagination } from "@/components/shared";
import { usePagination } from "@/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const PAGE_SIZE = 10;

export interface ProductListingClientProps {
  initialProducts: ProductRow[];
  listingVariant?: "b2b" | "b2c";
}

export function ProductListingClient({
  initialProducts,
  listingVariant = "b2c",
}: ProductListingClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [listingStatus, setListingStatus] = useState<string | undefined>(undefined);
  const [inventoryType, setInventoryType] = useState<string | undefined>(undefined);
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);
  const [priceMinDraft, setPriceMinDraft] = useState("0");
  const [priceMaxDraft, setPriceMaxDraft] = useState("100000");
  const [priceMinApplied, setPriceMinApplied] = useState("0");
  const [priceMaxApplied, setPriceMaxApplied] = useState("100000");
  const [searchQuery, setSearchQuery] = useState("");
  const [productToDelete, setProductToDelete] = useState<ProductRow | null>(null);
  const isB2B = listingVariant === "b2b";
  const priceFilterRef = useRef<HTMLDivElement>(null);

  const categoryOptions = useMemo(() => {
    const unique = [...new Set(products.map((p) => p.category))].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
    return [
      { label: "All Categories", value: "all" },
      ...unique.map((c) => ({ label: c, value: c })),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const getPriceValue = (value: string) => Number(value.replaceAll(/[^\d.]/g, "")) || 0;
    const minPrice = Number(priceMinApplied) || 0;
    const maxPrice = Number(priceMaxApplied) || Number.MAX_SAFE_INTEGER;
    let filtered = products.filter((p) => {
      const catOk = !category || category === "all" || p.category === category;
      const statusOk =
        !listingStatus || listingStatus === "all" || p.status === listingStatus;
      const invOk =
        !inventoryType ||
        inventoryType === "all" ||
        p.inventoryType === inventoryType;
      const price = getPriceValue(p.price);
      const rangeOk = !isB2B || (price >= minPrice && price <= maxPrice);
      return catOk && statusOk && invOk && rangeOk;
    });
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.articleNumber.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sizes.toLowerCase().includes(q) ||
          p.colors.toLowerCase().includes(q) ||
          PRODUCT_INVENTORY_TYPE_LABELS[p.inventoryType].toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [
    products,
    category,
    listingStatus,
    inventoryType,
    isB2B,
    priceMinApplied,
    priceMaxApplied,
    searchQuery,
  ]);

  useEffect(() => {
    if (!isPriceFilterOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (priceFilterRef.current && !priceFilterRef.current.contains(target)) {
        setIsPriceFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isPriceFilterOpen]);

  const pagination = usePagination({ totalCount: filteredProducts.length, pageSize: PAGE_SIZE });
  const paginatedProducts = useMemo(
    () => filteredProducts.slice(pagination.startIndex, pagination.endIndex),
    [filteredProducts, pagination.startIndex, pagination.endIndex]
  );

  const handleListingToggle = (row: ProductRow, newStatus: "active" | "inactive") => {
    setProducts((prev) =>
      prev.map((p) => (p.id === row.id ? { ...p, status: newStatus } : p))
    );
    toast.success(newStatus === "active" ? "Product is now active" : "Product set to inactive");
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    const { id, articleNumber, name } = productToDelete;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success(`${name} (${articleNumber}) was removed`);
    setProductToDelete(null);
  };

  const columns: TableColumn<ProductRow>[] = [
    { key: "name", header: "Product Name" },
    { key: "articleNumber", header: "Article Number" },
    { key: "category", header: "Category" },
    ...(isB2B
      ? []
      : [
          { key: "sizes", header: "Size" } as TableColumn<ProductRow>,
          { key: "colors", header: "Color" } as TableColumn<ProductRow>,
        ]),
    {
      key: "inventoryType",
      header: "Inventory Type",
      cell: (row) => PRODUCT_INVENTORY_TYPE_LABELS[row.inventoryType],
    },
    { key: "price", header: isB2B ? "WSP" : "Price", sortable: true },
    {
      key: "quantity",
      header: isB2B ? "Inventory Available" : "Quantity",
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) =>
        row.status === "active" ? (
          <span className="inline-flex rounded-full bg-black px-3 py-0.5 text-xs font-medium text-white">
            Active
          </span>
        ) : (
          <span className="inline-flex rounded-full border border-black bg-white px-3 py-0.5 text-xs font-medium text-black whitespace-nowrap">
            In-active
          </span>
        ),
    },
    {
      key: "toggle",
      header: "Status Switch",
      align: "center",
      cell: (row) => (
        <StatusToggle
          status={row.status}
          onToggle={(newStatus) => handleListingToggle(row, newStatus)}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={`Edit ${row.name}`}
            onClick={() => router.push(`/add-product?productId=${encodeURIComponent(row.id)}`)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.475 5.40783L18.592 7.52483M17.836 3.54283L12.109 9.26983C11.8122 9.56467 11.6102 9.94144 11.529 10.3518L11 12.9998L13.648 12.4698C14.058 12.3878 14.434 12.1868 14.73 11.8908L20.457 6.16383C20.6291 5.99173 20.7656 5.78742 20.8588 5.56256C20.9519 5.33771 20.9998 5.09671 20.9998 4.85333C20.9998 4.60994 20.9519 4.36895 20.8588 4.14409C20.7656 3.91923 20.6291 3.71492 20.457 3.54283C20.2849 3.37073 20.0806 3.23421 19.8557 3.14108C19.6309 3.04794 19.3899 3 19.1465 3C18.9031 3 18.6621 3.04794 18.4373 3.14108C18.2124 3.23421 18.0081 3.37073 17.836 3.54283Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 15V18C19 18.5304 18.7893 19.0391 18.4142 19.4142C18.0391 19.7893 17.5304 20 17 20H6C5.46957 20 4.96086 19.7893 4.58579 19.4142C4.21071 19.0391 4 18.5304 4 18V7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H9" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            aria-label={`Delete ${row.name}`}
            onClick={() => setProductToDelete(row)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.76953 5.48953H22.2295M9.90703 17.347V10.372M14.092 17.347V10.372M14.092 1.76953H9.90703C9.53705 1.76953 9.18223 1.9165 8.92062 2.17812C8.659 2.43973 8.51203 2.79455 8.51203 3.16453V5.48953H15.487V3.16453C15.487 2.79455 15.3401 2.43973 15.0784 2.17812C14.8168 1.9165 14.462 1.76953 14.092 1.76953ZM18.3793 20.9461C18.3535 21.2956 18.1961 21.6223 17.939 21.8605C17.6819 22.0986 17.3441 22.2305 16.9936 22.2295H7.00543C6.65498 22.2305 6.31718 22.0986 6.06006 21.8605C5.80294 21.6223 5.6456 21.2956 5.61973 20.9461L4.32703 5.48953H19.672L18.3793 20.9461Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
          Seller Dashboard &gt; Product Listing
        </nav>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
          <h1 className="text-xl font-semibold text-foreground">
            {isB2B ? "B2B Product Listing" : "B2C Product Listing"}
          </h1>
          <Link
            href="/add-product"
            className={cn(buttonVariants({ variant: "default", size: "lg" }))}
          >
            <Plus className="h-4 w-4" aria-hidden />
            <span className="ml-2">Add product</span>
          </Link>
        </div>
        <p className="text-gray-700">
          {isB2B
            ? "Manage your business-to-business products"
            : "Manage your business-to-consumer products"}
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
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="search"
                placeholder="Search Products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#E8E9E8] rounded-md border border-input px-10 py-2 text-md focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Search products"
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <AppSelect
                placeholder="All Categories"
                value={category}
                onChange={(value: string) => setCategory(value)}
                options={categoryOptions}
              />
              <AppSelect
                placeholder="All Status"
                value={listingStatus}
                onChange={(value: string) => setListingStatus(value)}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "In-active", value: "inactive" },
                ]}
              />
              <AppSelect
                placeholder="All Inventory Types"
                value={inventoryType}
                onChange={(value: string) => setInventoryType(value)}
                options={[
                  { label: "All Inventory Types", value: "all" },
                  { label: PRODUCT_INVENTORY_TYPE_LABELS.ready_to_ship, value: "ready_to_ship" },
                  { label: PRODUCT_INVENTORY_TYPE_LABELS.pre_booking, value: "pre_booking" },
                  { label: PRODUCT_INVENTORY_TYPE_LABELS.stock_clearance, value: "stock_clearance" },
                  { label: PRODUCT_INVENTORY_TYPE_LABELS.sale_or_return, value: "sale_or_return" },
                ]}
              />
              {isB2B && (
                <div className="relative ml-auto" ref={priceFilterRef}>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 min-w-[170px] justify-between gap-2 border-0 bg-[#E8E9E8] px-3 text-sm font-medium shadow-none hover:bg-[#dde0dd]"
                    onClick={() => setIsPriceFilterOpen((prev) => !prev)}
                  >
                    <span className="inline-flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Price Range
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {isPriceFilterOpen && (
                    <div className="absolute right-0 top-12 z-30 h-[210px] w-[315px] rounded-[5px] border border-border bg-white p-4 opacity-100 shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
                      <div className="flex items-center justify-between">
                        <h3 className="inline-flex items-center gap-2 text-base font-semibold leading-none text-[#131313]">
                          <SlidersHorizontal className="h-4 w-4" />
                          Price Range Filter
                        </h3>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 text-sm underline underline-offset-2"
                          onClick={() => {
                            setPriceMinDraft("0");
                            setPriceMaxDraft("100000");
                            setPriceMinApplied("0");
                            setPriceMaxApplied("100000");
                          }}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reset
                        </button>
                      </div>
                      <p className="mt-4 text-md font-medium text-muted-foreground">Price Range</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div>
                          <label htmlFor="price-range-min" className="mb-1.5 block text-sm font-medium leading-none">
                            Min
                          </label>
                          <input
                            id="price-range-min"
                            type="text"
                            inputMode="numeric"
                            value={priceMinDraft}
                            onChange={(e) => setPriceMinDraft(e.target.value.replaceAll(/\D/g, ""))}
                            className="h-8 w-full rounded-md border-0 bg-[#E8E9E8] px-2 text-lg text-[#6b6b6b] outline-none"
                          />
                        </div>
                        <div>
                          <label htmlFor="price-range-max" className="mb-1.5 block text-sm font-medium leading-none">
                            Max
                          </label>
                          <input
                            id="price-range-max"
                            type="text"
                            inputMode="numeric"
                            value={priceMaxDraft}
                            onChange={(e) => setPriceMaxDraft(e.target.value.replaceAll(/\D/g, ""))}
                            className="h-8 w-full rounded-md border-0 bg-[#E8E9E8] px-3 text-lg text-[#6b6b6b] outline-none"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        className="mt-4 h-10 w-full rounded-md bg-[#122130] text-base text-white hover:bg-[#0d1a28]"
                        onClick={() => {
                          setPriceMinApplied(priceMinDraft || "0");
                          setPriceMaxApplied(priceMaxDraft || "100000");
                          setIsPriceFilterOpen(false);
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DataTable
            columns={columns}
            data={paginatedProducts}
            striped
            emptyMessage="No products match your filters"
          />

          <div className="mt-4">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.setPage}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <DialogContent className="max-w-[min(100%,22rem)] border-0 bg-white p-8 shadow-lg sm:max-w-md">
          <div className="flex flex-col items-center text-center">
            <span className="my-6"><svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_3813_107021)">
                <path d="M9.76922 55.0172C6.7129 52.0653 4.27507 48.5343 2.59798 44.6302C0.92089 40.726 0.0381303 36.527 0.00120822 32.2781C-0.0357139 28.0291 0.773941 23.8154 2.38293 19.8827C3.99192 15.95 6.36802 12.3771 9.37258 9.37258C12.3771 6.36802 15.95 3.99192 19.8827 2.38293C23.8154 0.773941 28.0291 -0.0357139 32.2781 0.00120822C36.527 0.0381303 40.726 0.92089 44.6302 2.59798C48.5343 4.27507 52.0653 6.7129 55.0172 9.76922C60.8463 15.8045 64.0717 23.8878 63.9988 32.2781C63.9259 40.6684 60.5605 48.6944 54.6274 54.6274C48.6944 60.5605 40.6684 63.9259 32.2781 63.9988C23.8878 64.0717 15.8045 60.8463 9.76922 55.0172ZM50.5052 50.5052C55.3088 45.7016 58.0075 39.1865 58.0075 32.3932C58.0075 25.5999 55.3088 19.0848 50.5052 14.2812C45.7016 9.47762 39.1865 6.77899 32.3932 6.77899C25.5999 6.77899 19.0848 9.47762 14.2812 14.2812C9.47762 19.0848 6.77899 25.5999 6.77899 32.3932C6.77899 39.1865 9.47762 45.7016 14.2812 50.5052C19.0848 55.3088 25.5999 58.0075 32.3932 58.0075C39.1865 58.0075 45.7016 55.3088 50.5052 50.5052ZM29.1932 16.3932H35.5932V35.5932H29.1932V16.3932ZM29.1932 41.9932H35.5932V48.3932H29.1932V41.9932Z" fill="#962C2C" />
              </g>
              <defs>
                <clipPath id="clip0_3813_107021">
                  <rect width="64" height="64" fill="white" />
                </clipPath>
              </defs>
            </svg></span>

            <h2 className="mb-2 text-lg font-semibold text-foreground mt-4">
              Are you sure you want to delete this product?
            </h2>
            <p className="mb-8 text-sm text-muted-foreground">This action cannot be undone</p>
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
                className="h-11 flex-1 rounded-md bg-[#122130] font-medium text-white hover:bg-[#0d1a28]"
                onClick={handleConfirmDelete}
              >
                Yes! Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
