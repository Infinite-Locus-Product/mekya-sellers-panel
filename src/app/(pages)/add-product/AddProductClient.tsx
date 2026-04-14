"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FileText,
  ImageIcon,
  IndianRupee,
  List,
  Minus,
  Palette,
  Plus,
  Tag,
  Upload,
  Scaling,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/shared/AppSelect";
import { COLOR_PALETTE, ColorSelect } from "@/components/shared/ColorSelect";
import { cn } from "@/lib/utils";
import type { EditableProductDraft } from "@/lib/data";
import {
  PRODUCT_INVENTORY_TYPE_LABELS,
  type ProductInventoryType,
} from "@/lib/tableTypes";
import Image from "next/image";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
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
    <div className="space-y-2">
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
        toast.error(`${file.name}: max size is 2 MB`);
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

  const qtyRangeInvalid = maxQty <= minQty;

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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          <Card className="border bg-white shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <ImageIcon className="h-5 w-5 shrink-0" aria-hidden />
                Product Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                multiple
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.length) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-[#F9FAF9] px-6 py-12 text-center transition-colors",
                  isDragging && "border-foreground/50 bg-muted/30"
                )}
              >
                <Upload className="mb-3 h-10 w-10 text-muted-foreground" aria-hidden />
                <p className="text-sm font-medium text-foreground">
                  Choose a image or drag &amp; drop it here
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Supported image formats: PNG, JPG</p>
                <p className="text-xs text-muted-foreground">Max file size: 2 MB.</p>
              </div>

              {images.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">
                    {images.length} Image{images.length === 1 ? "" : "s"} uploaded
                  </p>
                  <ul className="flex flex-wrap gap-3">
                    {images.map((img) => (
                      <li key={img.id} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border">
                        <Image src={img.url} alt="" className="h-full w-full object-cover" width={80} height={80} />
                        <button
                          type="button"
                          className="absolute right-1 top-1 rounded  text-destructive shadow-sm hover:bg-white cursor-pointer"
                          aria-label="Remove image"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(img.id);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.6668 2.66667H10.3335L9.66683 2H6.3335L5.66683 2.66667H3.3335V4H12.6668M4.00016 12.6667C4.00016 13.0203 4.14064 13.3594 4.39069 13.6095C4.64074 13.8595 4.97987 14 5.3335 14H10.6668C11.0205 14 11.3596 13.8595 11.6096 13.6095C11.8597 13.3594 12.0002 13.0203 12.0002 12.6667V4.66667H4.00016V12.6667Z" fill="#FF0000" />
                          </svg>

                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border bg-white shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <FileText className="h-5 w-5 shrink-0" aria-hidden />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="space-y-2">
                <label htmlFor="product-name" className="text-sm font-medium">
                  Product Name <RequiredMark />
                </label>
                <Input
                  id="product-name"
                  placeholder="Enter product name."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="article-number" className="text-sm font-medium">
                  Article Number <RequiredMark />
                </label>
                <Input
                  id="article-number"
                  placeholder="Enter article number."
                  value={articleNumber}
                  onChange={(e) => setArticleNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">
                  Category <RequiredMark />
                </span>
                <AppSelect
                  className="w-full min-w-0"
                  placeholder="Select category."
                  value={category}
                  onChange={(v) => setCategory(v)}
                  options={categorySelectOptions}
                />
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">
                  Inventory Type <RequiredMark />
                </span>
                <AppSelect
                  className="w-full min-w-0"
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
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Scaling className="h-5 w-5 shrink-0" aria-hidden />
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
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Palette className="h-5 w-5 shrink-0" aria-hidden />
                Color Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="min-w-0 space-y-2">
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
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <IndianRupee className="h-5 w-5 shrink-0" aria-hidden />
                Pricing &amp; Quantity
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Price (₹)
                </label>
                <Input
                  id="price"
                  inputMode="decimal"
                  placeholder="Enter product's price."
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="qty" className="text-sm font-medium">
                  Available Quantity
                </label>
                <Input
                  id="qty"
                  inputMode="numeric"
                  placeholder="Enter available quantity."
                  value={availableQty}
                  onChange={(e) => setAvailableQty(e.target.value.replace(/\D/g, ""))}
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
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Tag className="h-5 w-5 shrink-0" aria-hidden />
                Product Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
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
                  className="sm:flex-1"
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
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <List className="h-5 w-5 shrink-0" aria-hidden />
                Product Description
              </CardTitle>
              <span className="text-xs text-muted-foreground tabular-nums">
                {description.length}/{DESCRIPTION_MAX} characters
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <label htmlFor="description" className="mb-2 block text-sm font-medium">
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
                "w-full resize-y rounded-md border border-[#D6D6D6] px-3 py-2 text-sm",
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
