"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Minus,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/shared/AppSelect";
import { COLOR_PALETTE, ColorSelect } from "@/components/shared/ColorSelect";
import { ProductImageUploadCard } from "@/components/shared/ProductImageUploadCard";
import { cn } from "@/lib/utils";
import type { EditableProductDraft } from "@/lib/data";
import {
  PRODUCT_INVENTORY_TYPE_LABELS,
  type ProductInventoryType,
} from "@/lib/tableTypes";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPT_IMAGES = ["image/png", "image/jpeg", "image/jpg"];
const DESCRIPTION_MAX = 1000;

type ImageItem = { id: string; url: string; file: File };

function QuantityStepper({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
}) {
  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex h-10 max-w-[140px] items-stretch overflow-hidden rounded-md">
        <button
          type="button"
          className="flex w-10 items-center justify-center text-lg leading-none"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="flex flex-1 items-center justify-center text-sm font-medium tabular-nums bg-[#F9FAF9] rounded-md">
          {value}
        </span>
        <button
          type="button"
          className="flex w-10 items-center justify-center text-lg leading-none"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + 1)}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function RequiredMark() {
  return <span className="text-destructive">*</span>;
}

export interface AddProductClientProps {
  categoryOptions: string[];
  initialProduct?: EditableProductDraft | null;
}

export function AddProductClient({ categoryOptions, initialProduct }: AddProductClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<ImageItem[]>([]);
  const isEditMode = Boolean(initialProduct);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [productName, setProductName] = useState(initialProduct?.name ?? "");
  const [articleNumber, setArticleNumber] = useState(initialProduct?.articleNumber ?? "");
  const [category, setCategory] = useState<string | undefined>(initialProduct?.category);
  const [inventoryType, setInventoryType] = useState<string | undefined>(initialProduct?.inventoryType);
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(
    () =>
      new Set(
        (initialProduct?.sizes ?? []).filter((size) =>
          SIZE_OPTIONS.includes(size as (typeof SIZE_OPTIONS)[number])
        )
      )
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(initialProduct?.colors ?? []);
  const [activeColorSelection, setActiveColorSelection] = useState<string | undefined>(undefined);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [price, setPrice] = useState(initialProduct?.price ?? "");
  const [availableQty, setAvailableQty] = useState(
    initialProduct ? String(initialProduct.availableQty) : ""
  );
  const [minQty, setMinQty] = useState(initialProduct?.minQty ?? 0);
  const [maxQty, setMaxQty] = useState(initialProduct?.maxQty ?? 0);
  const [tags, setTags] = useState<string[]>(initialProduct?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, []);

  const categorySelectOptions = [...new Set([...categoryOptions, ...(initialProduct?.category ? [initialProduct.category] : [])])].map((c) => ({ label: c, value: c }));
  const inventorySelectOptions = (
    Object.entries(PRODUCT_INVENTORY_TYPE_LABELS) as [ProductInventoryType, string][]
  ).map(([value, label]) => ({ label, value }));

  const addFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);
    for (const file of list) {
      if (!ACCEPT_IMAGES.includes(file.type)) {
        toast.error(`${file.name}: use PNG or JPG only`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`${file.name}: max size is 5 MB`);
        continue;
      }
      const url = URL.createObjectURL(file);
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setImages((prev) => [...prev, { id, url, file }]);
    }
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => {
      const next = new Set(prev);
      if (next.has(size)) next.delete(size);
      else next.add(size);
      return next;
    });
  };

  const selectColor = (value: string) => {
    setActiveColorSelection(value);
    setSelectedColors((prev) => {
      if (prev.includes(value)) {
        toast.info("Color already selected");
        return prev;
      }
      return [...prev, value];
    });
    setIsColorDropdownOpen(false);
    setActiveColorSelection(undefined);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (tags.includes(t)) {
      toast.info("Tag already added");
      return;
    }
    setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const hasQtyRangeInput = minQty > 0 || maxQty > 0;
  const qtyRangeInvalid = hasQtyRangeInput && maxQty <= minQty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!articleNumber.trim()) {
      toast.error("Article number is required");
      return;
    }
    if (!category) {
      toast.error("Category is required");
      return;
    }
    if (!inventoryType) {
      toast.error("Inventory type is required");
      return;
    }
    if (selectedColors.length === 0) {
      toast.error("Select at least one color");
      return;
    }
    if (selectedSizes.size === 0) {
      toast.error("Select at least one size");
      return;
    }
    if (qtyRangeInvalid) {
      toast.error("Maximum quantity must be greater than minimum quantity");
      return;
    }
    toast.success(
      isEditMode ? "Product updated (demo — connect API when ready)" : "Product saved (demo — connect API when ready)"
    );
    router.push("/product-listing");
  };

  return (
    <div className="space-y-6 pb-10">
      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/dashboard" className="hover:underline">
          Seller Dashboard
        </Link>
        {" > "}
        <Link href="/product-listing" className="hover:underline">
          Product Listing
        </Link>
        {" > "}
        <span className="text-foreground">{isEditMode ? "Edit Product" : "Add New Product"}</span>
      </nav>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="cursor-pointer" onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12L19 12M5 12L11 6M5 12L11 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditMode
              ? "Update the product information below"
              : "Fill the product’s information below"}
          </p>
        </div>

      </div>

      <form id="add-product-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <ProductImageUploadCard
            fileInputRef={fileInputRef}
            onFilesAdded={addFiles}
            uploadedImages={images}
            onRemoveImage={removeImage}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            maxFileSizeLabel="5 MB."
          />

          <Card className="border bg-white shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-normal">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.21667 17.8583L7.5 18.3333L5 16.6667L2.5 18.3333V2.5H17.5V8.5C16.975 8.275 16.3667 8.275 15.8333 8.51667V4.16667H4.16667V15.2167L5 14.6667L7.5 16.3333L8.21667 15.8333V17.8583ZM9.88333 16.6333L15 11.525L16.6917 13.225L11.5833 18.3333H9.88333V16.6333ZM18.0917 11.825L17.275 12.6417L15.575 10.9417L16.3917 10.125L16.4 10.1167L16.4083 10.1083C16.55 9.975 16.7667 9.96667 16.925 10.075C16.95 10.0833 16.975 10.1083 16.9917 10.125L18.0917 11.225C18.2583 11.3917 18.2583 11.6667 18.0917 11.825ZM14.1667 7.5V5.83333H5.83333V7.5H14.1667ZM12.5 10.8333V9.16667H5.83333V10.8333H12.5Z" fill="black" />
                </svg>

                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="space-y-3">
                <label htmlFor="product-name" className="text-sm font-medium">
                  Product Name <RequiredMark />
                </label>
                <Input
                  id="product-name"
                  placeholder="Enter product name."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-3">
                <label htmlFor="article-number" className="text-sm font-medium">
                  Article Number <RequiredMark />
                </label>
                <Input
                  id="article-number"
                  placeholder="Enter article number."
                  value={articleNumber}
                  onChange={(e) => setArticleNumber(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-3">
                <span className="text-sm font-medium">
                  Category <RequiredMark />
                </span>
                <AppSelect
                  className="w-full min-w-0 bg-white text-foreground data-[placeholder]:text-muted-foreground"
                  placeholder="Select category."
                  value={category}
                  onChange={(v) => setCategory(v)}
                  options={categorySelectOptions}
                />
              </div>
              <div className="space-y-3">
                <span className="text-sm font-medium">
                  Inventory Type <RequiredMark />
                </span>
                <AppSelect
                  className="w-full min-w-0 bg-white text-foreground data-[placeholder]:text-muted-foreground"
                  placeholder="Select Inventory type."
                  value={inventoryType}
                  onChange={(v) => setInventoryType(v)}
                  options={inventorySelectOptions}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border bg-white shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-normal">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M15.3331 4.06641C15.4922 4.06641 15.6448 4.12962 15.7573 4.24214C15.8699 4.35466 15.9331 4.50728 15.9331 4.66641V9.99974C15.9331 10.1589 15.8699 10.3115 15.7573 10.424C15.6448 10.5365 15.4922 10.5997 15.3331 10.5997C15.1739 10.5997 15.0213 10.5365 14.9088 10.424C14.7963 10.3115 14.7331 10.1589 14.7331 9.99974V6.11441L6.11441 14.7331H9.99974C10.1589 14.7331 10.3115 14.7963 10.424 14.9088C10.5365 15.0213 10.5997 15.1739 10.5997 15.3331C10.5997 15.4922 10.5365 15.6448 10.424 15.7573C10.3115 15.8699 10.1589 15.9331 9.99974 15.9331H4.66641C4.50728 15.9331 4.35466 15.8699 4.24214 15.7573C4.12962 15.6448 4.06641 15.4922 4.06641 15.3331V9.99974C4.06641 9.92095 4.08193 9.84293 4.11208 9.77013C4.14223 9.69733 4.18643 9.63119 4.24214 9.57547C4.29786 9.51976 4.364 9.47556 4.4368 9.44541C4.50959 9.41526 4.58761 9.39974 4.66641 9.39974C4.7452 9.39974 4.82322 9.41526 4.89602 9.44541C4.96881 9.47556 5.03496 9.51976 5.09067 9.57547C5.14639 9.63119 5.19058 9.69733 5.22073 9.77013C5.25089 9.84293 5.26641 9.92095 5.26641 9.99974V13.8851L13.8851 5.26641H9.99974C9.84061 5.26641 9.688 5.20319 9.57547 5.09067C9.46295 4.97815 9.39974 4.82554 9.39974 4.66641C9.39974 4.50728 9.46295 4.35466 9.57547 4.24214C9.688 4.12962 9.84061 4.06641 9.99974 4.06641H15.3331Z" fill="black" />
                </svg>

                Size Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((size) => {
                  const on = selectedSizes.has(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={cn(
                        "min-w-[2.5rem] rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                        on
                          ? "border-black bg-black text-white"
                          : "border-input bg-white text-foreground hover:bg-muted/40"
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Selected Sizes :</p>
                <div className="flex flex-wrap gap-2">
                  {[...selectedSizes].sort((a, b) => SIZE_OPTIONS.indexOf(a as (typeof SIZE_OPTIONS)[number]) - SIZE_OPTIONS.indexOf(b as (typeof SIZE_OPTIONS)[number])).map((s) => (
                    <span
                      key={s}
                      className="inline-flex rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                    >
                      {s}
                    </span>
                  ))}
                  {selectedSizes.size === 0 && (
                    <span className="text-xs text-muted-foreground">None selected</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-white shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-normal">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.6501 8.0917C13.4627 7.76736 12.1974 7.8924 11.0965 8.44286C9.99557 8.99332 9.13637 9.93053 8.68342 11.075M14.6501 8.0917C15.3774 8.29058 16.0502 8.65137 16.6184 9.14706C17.1865 9.64275 17.6352 10.2605 17.9308 10.9541C18.2265 11.6477 18.3614 12.3992 18.3256 13.1523C18.2897 13.9055 18.084 14.6407 17.7238 15.3031C17.3637 15.9655 16.8583 16.5379 16.2457 16.9774C15.633 17.4169 14.9289 17.7121 14.1861 17.841C13.4432 17.9699 12.6808 17.9291 11.9559 17.7217C11.231 17.5143 10.5624 17.1457 10.0001 16.6434M14.6501 8.0917C14.9498 7.33343 15.0595 6.51336 14.9696 5.70297C14.8798 4.89258 14.5931 4.11646 14.1346 3.44223C13.6761 2.76801 13.0597 2.21614 12.3391 1.83472C11.6184 1.4533 10.8154 1.25391 10.0001 1.25391C9.18473 1.25391 8.38175 1.4533 7.66111 1.83472C6.94047 2.21614 6.32404 2.76801 5.86554 3.44223C5.40703 4.11646 5.12037 4.89258 5.03053 5.70297C4.94069 6.51336 5.05039 7.33343 5.35008 8.0917M8.68342 11.075C8.45168 11.6614 8.33293 12.2862 8.33342 12.9167C8.33342 14.3975 8.97758 15.7284 10.0001 16.6434M8.68342 11.075C7.93459 10.8701 7.24365 10.494 6.66516 9.97621C6.08667 9.45846 5.63646 8.81331 5.35008 8.0917M10.0001 16.6434C9.4378 17.1457 8.7692 17.5143 8.0443 17.7217C7.31941 17.9291 6.55699 17.9699 5.81411 17.841C5.07123 17.7121 4.36712 17.4169 3.75447 16.9774C3.14183 16.5379 2.63651 15.9655 2.27633 15.3031C1.91615 14.6407 1.71045 13.9055 1.6746 13.1523C1.63875 12.3992 1.7737 11.6477 2.06934 10.9541C2.36497 10.2605 2.81365 9.64275 3.38178 9.14706C3.94992 8.65137 4.6228 8.29058 5.35008 8.0917" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                Color Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="min-w-0 space-y-3">
                <span className="text-sm font-medium">
                  Color <RequiredMark />
                </span>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-3">
                  <ColorSelect
                    className="w-full min-w-0"
                    placeholder="Select color."
                    value={activeColorSelection}
                    onChange={selectColor}
                    open={isColorDropdownOpen}
                    onOpenChange={setIsColorDropdownOpen}
                  />
                  <Button
                    type="button"
                    className="h-9 whitespace-nowrap bg-[#122130] px-3 text-xs hover:bg-[#0d1a28]"
                    onClick={() => setIsColorDropdownOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add more color
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {selectedColors.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No color selected</span>
                  ) : (
                    selectedColors.map((color) => {
                      const palette = COLOR_PALETTE.find((entry) => entry.value === color);
                      return (
                        <span
                          key={color}
                          className="inline-flex items-center gap-2 rounded-xs bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                        >
                          <span
                            className="size-3 rounded-full border border-black/10"
                            style={{ backgroundColor: palette?.hex ?? "#9ca3af" }}
                            aria-hidden
                          />
                          {color}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border bg-white shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-normal">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_3813_105761)">
                    <path d="M10.0003 18.3346C14.6027 18.3346 18.3337 14.6037 18.3337 10.0013C18.3337 5.39893 14.6027 1.66797 10.0003 1.66797C5.39795 1.66797 1.66699 5.39893 1.66699 10.0013C1.66699 14.6037 5.39795 18.3346 10.0003 18.3346Z" stroke="black" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7.5 9.16927H12.9167M12.9167 5.83594H7.5C8.38405 5.83594 9.2319 6.18713 9.85702 6.81225C10.4821 7.43737 10.8333 8.28522 10.8333 9.16927C10.8333 10.0533 10.4821 10.9012 9.85702 11.5263C9.2319 12.1514 8.38405 12.5026 7.5 12.5026L10 15.0026" stroke="black" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_3813_105761">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>

                Pricing &amp; Quantity
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
              <div className="space-y-3 sm:col-span-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Price (₹)
                </label>
                <Input
                  id="price"
                  inputMode="decimal"
                  placeholder="Enter product's price."
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-3 sm:col-span-2">
                <label htmlFor="qty" className="text-sm font-medium">
                  Available Quantity
                </label>
                <Input
                  id="qty"
                  inputMode="numeric"
                  placeholder="Enter available quantity."
                  value={availableQty}
                  onChange={(e) => setAvailableQty(e.target.value.replace(/\D/g, ""))}
                  className="bg-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <QuantityStepper label="Minimum Quantity" value={minQty} onChange={setMinQty} />
                <QuantityStepper label="Maximum Quantity" value={maxQty} onChange={setMaxQty} />
                {qtyRangeInvalid && (
                  <p className="text-xs text-destructive" role="alert">
                    Maximum quantity must be greater than minimum quantity. Increase maximum above{" "}
                    {minQty}.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-white shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-normal">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 6.66667V10.1433C2.50009 10.5853 2.67575 11.0092 2.98833 11.3217L7.74667 16.08C8.12329 16.4566 8.63408 16.6681 9.16667 16.6681C9.69926 16.6681 10.21 16.4566 10.5867 16.08L13.58 13.0867C13.9566 12.71 14.1681 12.1993 14.1681 11.6667C14.1681 11.1341 13.9566 10.6233 13.58 10.2467L8.82167 5.48833C8.50918 5.17575 8.08532 5.00009 7.64333 5H4.16667C3.72464 5 3.30072 5.17559 2.98816 5.48816C2.67559 5.80072 2.5 6.22464 2.5 6.66667Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15.0002 15.8333L16.3269 14.5067C17.08 13.7534 17.5031 12.7318 17.5031 11.6667C17.5031 10.6015 17.08 9.57992 16.3269 8.82667L12.5002 5M5.83353 8.33333H5.8252" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                Product Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              Add a Tag
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Example : White Shirt"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="sm:flex-1 bg-white"
                />
                <Button type="button" variant="secondary" className="shrink-0" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Tags :</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs font-medium"
                    >
                      {t}
                      <button
                        type="button"
                        className="rounded p-0.5 hover:bg-background"
                        aria-label={`Remove ${t}`}
                        onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
                      >
                        <span className="text-muted-foreground">×</span>
                      </button>
                    </span>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-xs text-muted-foreground">No tags yet</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border bg-white shadow-sm">
          <CardHeader className="border-b pb-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-normal">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.875 3.75C1.70924 3.75 1.55027 3.81585 1.43306 3.93306C1.31585 4.05027 1.25 4.20924 1.25 4.375C1.25 4.54076 1.31585 4.69973 1.43306 4.81694C1.55027 4.93415 1.70924 5 1.875 5H18.125C18.2908 5 18.4497 4.93415 18.5669 4.81694C18.6842 4.69973 18.75 4.54076 18.75 4.375C18.75 4.20924 18.6842 4.05027 18.5669 3.93306C18.4497 3.81585 18.2908 3.75 18.125 3.75H1.875ZM1.875 7.5C1.70924 7.5 1.55027 7.56585 1.43306 7.68306C1.31585 7.80027 1.25 7.95924 1.25 8.125C1.25 8.29076 1.31585 8.44973 1.43306 8.56694C1.55027 8.68415 1.70924 8.75 1.875 8.75H18.125C18.2908 8.75 18.4497 8.68415 18.5669 8.56694C18.6842 8.44973 18.75 8.29076 18.75 8.125C18.75 7.95924 18.6842 7.80027 18.5669 7.68306C18.4497 7.56585 18.2908 7.5 18.125 7.5H1.875ZM1.25 11.875C1.25 11.7092 1.31585 11.5503 1.43306 11.4331C1.55027 11.3158 1.70924 11.25 1.875 11.25H18.125C18.2908 11.25 18.4497 11.3158 18.5669 11.4331C18.6842 11.5503 18.75 11.7092 18.75 11.875C18.75 12.0408 18.6842 12.1997 18.5669 12.3169C18.4497 12.4342 18.2908 12.5 18.125 12.5H1.875C1.70924 12.5 1.55027 12.4342 1.43306 12.3169C1.31585 12.1997 1.25 12.0408 1.25 11.875ZM1.875 15C1.70924 15 1.55027 15.0658 1.43306 15.1831C1.31585 15.3003 1.25 15.4592 1.25 15.625C1.25 15.7908 1.31585 15.9497 1.43306 16.0669C1.55027 16.1842 1.70924 16.25 1.875 16.25H13.125C13.2908 16.25 13.4497 16.1842 13.5669 16.0669C13.6842 15.9497 13.75 15.7908 13.75 15.625C13.75 15.4592 13.6842 15.3003 13.5669 15.1831C13.4497 15.0658 13.2908 15 13.125 15H1.875Z" fill="black" />
                </svg>

                Product Description
              </CardTitle>
              <span className="text-xs text-muted-foreground tabular-nums">
                {description.length}/{DESCRIPTION_MAX} characters
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <label htmlFor="description" className="mb-3 block text-sm font-medium">
              Write Description About Your Product.
            </label>
            <textarea
              id="description"
              rows={6}
              maxLength={DESCRIPTION_MAX}
              placeholder="Describe your product for buyers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(
                "w-full resize-y rounded-md border border-[#D6D6D6] bg-white px-3 py-2 text-sm",
                "placeholder:text-muted-foreground focus-visible:outline-none"
              )}
            />
          </CardContent>
        </Card>
      </form>
      <div className="flex flex-wrap gap-2 justify-end">
        <Link href="/product-listing" className={cn(buttonVariants({ variant: "outline", size: "default" }))}>
          Save as Draft
        </Link>
        <Button type="submit" form="add-product-form" className="bg-[#122130] hover:bg-[#0d1a28]">
          {isEditMode ? "Update product" : "Publish product"}
        </Button>
      </div>
    </div>
  );
}
