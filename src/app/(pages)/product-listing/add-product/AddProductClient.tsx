"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Lock,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/shared/AppSelect";
import { MultiSelectFilter } from "@/components/shared/MultiSelectFilter";
import { ColorSelect } from "@/components/shared/ColorSelect";
import { ProductImageUploadCard } from "@/components/shared/ProductImageUploadCard";
import { cn } from "@/lib/utils";
import type { EditableProductDraft } from "@/lib/data";
import {
  PRODUCT_INVENTORY_TYPE_LABELS,
  SELECTABLE_PRODUCT_INVENTORY_TYPES,
  type ProductInventoryType,
} from "@/lib/tableTypes";
import {
  createProduct,
  getProduct,
  parseProductDescription,
  publishProduct,
  updateProduct,
  updateProductVariant,
  uploadImagesToStorage,
  type FlatVariant,
  type SetPurchaseMode,
} from "@/lib/api/products";
import {
  getTaxonomyManifest,
  getSizeSystem,
  categoriesForGender,
  subcategoriesFor,
  templateFor,
  colorAttributeValues,
  tagsByGroup,
  attributeBySlug,
  type TaxonomyManifest,
} from "@/lib/api/taxonomy";

const SET_PURCHASE_MODE_OPTIONS: { label: string; value: SetPurchaseMode }[] = [
  { label: "Any size, any color (custom mix & match)", value: "custom_mix_match" },
  { label: "One size, multiple colors per set", value: "single_size_multi_color" },
  { label: "Multiple sizes, one color per set", value: "multi_size_single_color" },
];

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGES = 5;
const ACCEPT_IMAGES = ["image/png", "image/jpeg", "image/jpg"];
const DESCRIPTION_MAX = 1000;

type ImageItem = { id: string; url: string; file: File };
/** One (color, size) cell of the create-time pricing/stock matrix — replaces
 * the old "name"-string keyed row so overrides can be built directly by
 * (color, size), matching PriceOverride/StockOverride exactly. */
type VariantPricingRow = { color: string; size: string; b2c_price: string; b2b_price: string; qty: string };

type ProductDraftState = {
  productName: string;
  articleNumber: string;
  gender: string | undefined;
  categorySlug: string | undefined;
  subcategorySlug: string | undefined;
  inventoryType: string | undefined;
  mrp: string;
  minQty: number;
  maxQty: number;
  selectedColors: string[];
  selectedSizes: string[];
  attributeSelections: Record<string, string[]>;
  tagSlugs: string[];
  description: string;
  channels: "b2c" | "b2b" | "both";
  isCustomisable: boolean;
  moqSets: string;
  moqUnits: string;
  shipsFrom: string;
  setPurchaseMode: SetPurchaseMode;
  variantPricing?: VariantPricingRow[];
  excludedCells: string[];
  b2bMinOrderQty: string;
  b2bMaxOrderQty: string;
  b2cMinOrderQty: string;
  b2cMaxOrderQty: string;
};

function computeVariantRows(colors: string[], sizes: string[]): { color: string; size: string }[] {
  if (colors.length === 0) return [];
  if (sizes.length === 0) return colors.map((c) => ({ color: c, size: "Default" }));
  return colors.flatMap((c) => sizes.map((s) => ({ color: c, size: s })));
}

function RequiredMark() {
  return <span className="text-destructive">*</span>;
}

/** Category/subcategory/gender/inventory type/set purchase mode can never be
 * changed once a product exists — reassigning them requires resubmitting the
 * full attribute + variant matrix together, a flow this form doesn't offer.
 * Shown as visibly locked (not a plain editable-looking select) so editing
 * never reads as broken. */
function LockedField({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed border-input bg-muted/40 px-3 py-2 text-sm text-foreground">
      <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="flex-1">{value || "—"}</span>
      <span
        className="shrink-0 text-xs text-muted-foreground"
        title="This can't be changed after the product is created — it would require reassigning every attribute and variant at once, which this form doesn't support."
      >
        Locked
      </span>
    </div>
  );
}

export interface AddProductClientProps {
  initialProduct?: EditableProductDraft | null;
  productId?: string;
  defaultChannel?: "b2c" | "b2b" | "both";
}

export function AddProductClient({ initialProduct: initialProductProp, productId, defaultChannel }: AddProductClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<ImageItem[]>([]);
  const submittedRef = useRef(false);
  // Tracks a product_id that was created but not yet published (e.g. on publish failure).
  // Prevents duplicate products when the user retries after a partial failure.
  const pendingProductIdRef = useRef<string | null>(null);
  const [manifest, setManifest] = useState<TaxonomyManifest | null>(null);
  const [initialProduct, setInitialProduct] = useState<EditableProductDraft | null>(initialProductProp ?? null);
  const isEditMode = Boolean(productId ?? initialProduct);
  const [isFetchingProduct, setIsFetchingProduct] = useState(() => Boolean(productId));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [productName, setProductName] = useState(initialProduct?.name ?? "");
  const [articleNumber, setArticleNumber] = useState(initialProduct?.articleNumber ?? "");
  const [inventoryType, setInventoryType] = useState<string | undefined>(initialProduct?.inventoryType);
  const [gender, setGender] = useState<string | undefined>(initialProduct?.gender);
  const [categorySlug, setCategorySlug] = useState<string | undefined>(initialProduct?.categorySlug);
  const [subcategorySlug, setSubcategorySlug] = useState<string | undefined>(initialProduct?.subcategorySlug);
  const [setPurchaseMode, setSetPurchaseMode] = useState<SetPurchaseMode>(
    (initialProduct?.setPurchaseMode as SetPurchaseMode) ?? "custom_mix_match"
  );
  const [sizeOptions, setSizeOptions] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(
    () => new Set(initialProduct?.sizes ?? [])
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(initialProduct?.colors ?? []);
  const [activeColorSelection, setActiveColorSelection] = useState<string | undefined>(undefined);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [channels, setChannels] = useState<"b2c" | "b2b" | "both">(initialProduct?.channels ?? defaultChannel ?? "both");
  const [mrp, setMrp] = useState(initialProduct?.mrp ?? "");
  const [productVariants, setProductVariants] = useState<FlatVariant[]>([]);
  const [variantEdits, setVariantEdits] = useState<
    Record<string, { b2c_price: string; b2b_price: string; quantity: string }>
  >({});
  const [savingVariantId, setSavingVariantId] = useState<string | null>(null);
  const [variantPricing, setVariantPricing] = useState<VariantPricingRow[]>([]);
  /** Color × size cells excluded from the variant matrix (keyed `${color} ${size}`).
   * On create these are combinations the seller unchecked; on edit they additionally
   * start out covering every cell the product has no saved variant for. */
  const [excludedCells, setExcludedCells] = useState<Set<string>>(new Set());
  const [minQty, setMinQty] = useState(initialProduct?.minQty ?? 0);
  const [maxQty, setMaxQty] = useState(initialProduct?.maxQty ?? 0);
  const [attributeSelections, setAttributeSelections] = useState<Record<string, string[]>>(
    initialProduct?.attributeSelections ?? {}
  );
  const [tagSlugs, setTagSlugs] = useState<string[]>(initialProduct?.tagSlugs ?? []);
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [isCustomisable, setIsCustomisable] = useState(initialProduct?.isCustomisable ?? false);
  const [moqSets, setMoqSets] = useState(initialProduct?.moqSets ? String(initialProduct.moqSets) : "");
  const [moqUnits, setMoqUnits] = useState(initialProduct?.moqUnits ? String(initialProduct.moqUnits) : "");
  const [shipsFrom, setShipsFrom] = useState(initialProduct?.shipsFrom ?? "");
  // Channel order limits — business ordering policy, not a stock split; one
  // physical inventory pool stays untouched (see products.ts's ProductDefinitionDto doc).
  const [b2bMinOrderQty, setB2bMinOrderQty] = useState(
    initialProduct?.b2bMinOrderQty ? String(initialProduct.b2bMinOrderQty) : ""
  );
  const [b2bMaxOrderQty, setB2bMaxOrderQty] = useState(
    initialProduct?.b2bMaxOrderQty ? String(initialProduct.b2bMaxOrderQty) : ""
  );
  const [b2cMinOrderQty, setB2cMinOrderQty] = useState(
    initialProduct?.b2cMinOrderQty ? String(initialProduct.b2cMinOrderQty) : ""
  );
  const [b2cMaxOrderQty, setB2cMaxOrderQty] = useState(
    initialProduct?.b2cMaxOrderQty ? String(initialProduct.b2cMaxOrderQty) : ""
  );
  const [legacySizeInput, setLegacySizeInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState<ProductDraftState | null>(null);
  const [existingImages, setExistingImages] = useState<Array<{ id: string; url: string }>>([]);
  const existingImagesRef = useRef<Array<{ id: string; url: string }>>([]);
  const isLegacy = initialProduct?.isLegacy ?? false;

  const draftKey = `mekya_seller_draft_${productId ?? "new"}`;

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    existingImagesRef.current = existingImages;
  }, [existingImages]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, []);

  // ── Taxonomy manifest — fetched once, drives gender/category/subcategory/
  // attribute/tag/color options. Sizes come from the dedicated size-system
  // endpoint below since they depend on gender+category together.
  useEffect(() => {
    getTaxonomyManifest()
      .catch(() => {
        toast.error("Failed to load product taxonomy. Please refresh the page.");
        return null;
      })
      .then((m) => { if (m) setManifest(m); });
  }, []);

  // ── Size system — depends on gender + category, refetched whenever either changes.
  useEffect(() => {
    if (isLegacy) return; // legacy products use free-form legacy_sizes instead
    if (!gender || !categorySlug) {
      setSizeOptions([]);
      return;
    }
    let cancelled = false;
    getSizeSystem(gender, categorySlug)
      .then((values) => { if (!cancelled) setSizeOptions(values); })
      .catch(() => { if (!cancelled) setSizeOptions([]); });
    return () => { cancelled = true; };
  }, [gender, categorySlug, isLegacy]);

  useEffect(() => {
    if (productId) {
      getProduct(productId)
        .then((prod) => {
          const legacy = prod.is_legacy;
          const colors = legacy
            ? (prod.legacy?.colors ?? [])
            : (prod.variants?.colors.map((c) => c.color) ?? []);
          const sizes = legacy
            ? (prod.legacy?.sizes ?? [])
            : Array.from(new Set(prod.variants?.colors.flatMap((c) => c.sizes.map((s) => s.size)) ?? []));
          setInitialProduct({
            id: prod.id,
            name: prod.name,
            articleNumber: prod.product.article_number ?? "",
            isLegacy: legacy,
            categoryName: prod.category?.name ?? "",
            categorySlug: legacy ? undefined : prod.taxonomy?.category_slug,
            subcategorySlug: legacy ? undefined : prod.taxonomy?.subcategory_slug,
            inventoryType: (prod.product.inventory_type as ProductInventoryType) ?? "ready_to_ship",
            gender: legacy ? (prod.legacy?.gender ?? undefined) : prod.taxonomy?.gender,
            setPurchaseMode: prod.product.set_purchase_mode ?? undefined,
            sizes,
            colors,
            attributeSelections: legacy ? {} : (prod.taxonomy?.attributes ?? {}),
            tagSlugs: legacy ? [] : (prod.taxonomy?.tags ?? []),
            mrp: prod.metadata.mrp ?? "",
            minQty: prod.product.min_quantity_per_set ?? 0,
            maxQty: prod.product.max_quantity_per_set ?? 0,
            isCustomisable: prod.product.is_customisable,
            moqSets: prod.product.moq_sets ?? undefined,
            moqUnits: prod.product.moq_units ?? undefined,
            shipsFrom: prod.product.ships_from ?? "",
            b2bMinOrderQty: prod.product.b2b_min_order_qty ?? undefined,
            b2bMaxOrderQty: prod.product.b2b_max_order_qty ?? undefined,
            b2cMinOrderQty: prod.product.b2c_min_order_qty ?? undefined,
            b2cMaxOrderQty: prod.product.b2c_max_order_qty ?? undefined,
            description: parseProductDescription(prod.description),
            images: prod.images.map((img) => ({ id: img.id, url: img.url })),
            channels: (prod.metadata.channels as "b2c" | "b2b" | "both") ?? "both",
          });
          setProductVariants(prod.variant_list);
        })
        .catch(() => toast.error("Failed to load product details. Please go back and try again."))
        .finally(() => setIsFetchingProduct(false));
    }
  }, [productId]);

  useEffect(() => {
    if (!initialProduct) return;
    setProductName(initialProduct.name);
    setArticleNumber(initialProduct.articleNumber);
    setInventoryType(initialProduct.inventoryType);
    setGender(initialProduct.gender);
    setCategorySlug(initialProduct.categorySlug);
    setSubcategorySlug(initialProduct.subcategorySlug);
    setSetPurchaseMode((initialProduct.setPurchaseMode as SetPurchaseMode) ?? "custom_mix_match");
    setSelectedSizes(new Set(initialProduct.sizes));
    setSelectedColors(initialProduct.colors);
    setChannels(initialProduct.channels ?? "both");
    setMrp(initialProduct.mrp);
    setMinQty(initialProduct.minQty);
    setMaxQty(initialProduct.maxQty);
    setAttributeSelections(initialProduct.attributeSelections);
    setTagSlugs(initialProduct.tagSlugs);
    setDescription(initialProduct.description);
    setIsCustomisable(initialProduct.isCustomisable);
    setMoqSets(initialProduct.moqSets ? String(initialProduct.moqSets) : "");
    setMoqUnits(initialProduct.moqUnits ? String(initialProduct.moqUnits) : "");
    setShipsFrom(initialProduct.shipsFrom ?? "");
    setB2bMinOrderQty(initialProduct.b2bMinOrderQty ? String(initialProduct.b2bMinOrderQty) : "");
    setB2bMaxOrderQty(initialProduct.b2bMaxOrderQty ? String(initialProduct.b2bMaxOrderQty) : "");
    setB2cMinOrderQty(initialProduct.b2cMinOrderQty ? String(initialProduct.b2cMinOrderQty) : "");
    setB2cMaxOrderQty(initialProduct.b2cMaxOrderQty ? String(initialProduct.b2cMaxOrderQty) : "");
    setExistingImages(initialProduct.images ?? []);
  }, [initialProduct]);

  useEffect(() => {
    if (productVariants.length === 0) return;
    const edits: Record<string, { b2c_price: string; b2b_price: string; quantity: string }> = {};
    for (const v of productVariants) {
      edits[v.id] = {
        b2c_price: v.b2c_price != null ? String(v.b2c_price) : "",
        b2b_price: v.b2b_price != null ? String(v.b2b_price) : "",
        quantity: v.quantity != null ? String(v.quantity) : "",
      };
    }
    setVariantEdits(edits);
  }, [productVariants]);

  /**
   * Seeds the create-style variant matrix from an existing product so the edit form opens on
   * its real prices and stock rather than blanks.
   *
   * A product's variants can be sparse — the seller may have unchecked cells at create time —
   * while the matrix below always renders the full color × size grid. Any cell with no saved
   * variant is therefore pre-excluded, which keeps `includedVariantRows` exactly equal to what
   * the product already has. Without that, simply opening the form would look like the seller
   * had added every missing combination.
   */
  useEffect(() => {
    if (!initialProduct || productVariants.length === 0) return;
    const saved = new Map(
      productVariants
        .filter((v) => v.color && v.size)
        .map((v) => [`${v.color} ${v.size}`, v])
    );
    const rows = computeVariantRows(initialProduct.colors, initialProduct.sizes);
    setVariantPricing(
      rows.map(({ color, size }) => {
        const v = saved.get(`${color} ${size}`);
        return {
          color,
          size,
          b2c_price: v?.b2c_price != null ? String(v.b2c_price) : "",
          b2b_price: v?.b2b_price != null ? String(v.b2b_price) : "",
          qty: v?.quantity != null ? String(v.quantity) : "",
        };
      })
    );
    setExcludedCells(
      new Set(
        rows
          .filter(({ color, size }) => !saved.has(`${color} ${size}`))
          .map(({ color, size }) => `${color} ${size}`)
      )
    );
  }, [initialProduct, productVariants]);

  useEffect(() => {
    const sortedSizes = [...selectedSizes].sort((a, b) =>
      sizeOptions.indexOf(a) - sizeOptions.indexOf(b)
    );
    const rows = computeVariantRows(selectedColors, sortedSizes);
    setVariantPricing((prev) => {
      const existingMap = new Map(prev.map((r) => [`${r.color} ${r.size}`, r]));
      return rows.map(
        ({ color, size }) =>
          existingMap.get(`${color} ${size}`) ?? { color, size, b2c_price: "", b2b_price: "", qty: "" }
      );
    });
  }, [selectedColors, selectedSizes, sizeOptions]);

  const saveDraftToStorage = useCallback(() => {
    if (submittedRef.current) return;
    try {
      const data: ProductDraftState = {
        productName,
        articleNumber,
        gender,
        categorySlug,
        subcategorySlug,
        inventoryType,
        mrp,
        minQty,
        maxQty,
        selectedColors,
        selectedSizes: [...selectedSizes],
        attributeSelections,
        tagSlugs,
        description,
        channels,
        isCustomisable,
        moqSets,
        moqUnits,
        shipsFrom,
        setPurchaseMode,
        variantPricing: isEditMode ? undefined : variantPricing,
        excludedCells: [...excludedCells],
        b2bMinOrderQty,
        b2bMaxOrderQty,
        b2cMinOrderQty,
        b2cMaxOrderQty,
      };
      localStorage.setItem(draftKey, JSON.stringify(data));
    } catch {
      // localStorage unavailable — silent fail
    }
  }, [productName, articleNumber, gender, categorySlug, subcategorySlug, inventoryType, mrp, minQty, maxQty, selectedColors, selectedSizes, attributeSelections, tagSlugs, description, channels, isCustomisable, moqSets, moqUnits, shipsFrom, setPurchaseMode, isEditMode, variantPricing, excludedCells, b2bMinOrderQty, b2bMaxOrderQty, b2cMinOrderQty, b2cMaxOrderQty, draftKey]);

  const saveDraftRef = useRef(saveDraftToStorage);
  useEffect(() => {
    saveDraftRef.current = saveDraftToStorage;
  }, [saveDraftToStorage]);

  useEffect(() => {
    const interval = setInterval(() => saveDraftRef.current(), 30_000);
    const handleBeforeUnload = () => saveDraftRef.current();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (isFetchingProduct) return;
    try {
      const saved = localStorage.getItem(draftKey);
      if (!saved) return;
      const draft = JSON.parse(saved) as ProductDraftState;
      setRestoredDraft(draft);
      setShowRestorePrompt(true);
    } catch {
      // ignore parse errors
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetchingProduct]);

  const handleRestoreDraft = () => {
    if (!restoredDraft) return;
    setProductName(restoredDraft.productName);
    setArticleNumber(restoredDraft.articleNumber);
    setGender(restoredDraft.gender);
    setCategorySlug(restoredDraft.categorySlug);
    setSubcategorySlug(restoredDraft.subcategorySlug);
    setInventoryType(restoredDraft.inventoryType);
    setChannels(restoredDraft.channels ?? "both");
    setMrp(restoredDraft.mrp);
    setMinQty(restoredDraft.minQty);
    setMaxQty(restoredDraft.maxQty);
    setSelectedColors(restoredDraft.selectedColors);
    setSelectedSizes(new Set(restoredDraft.selectedSizes));
    setAttributeSelections(restoredDraft.attributeSelections ?? {});
    setTagSlugs(restoredDraft.tagSlugs ?? []);
    setDescription(restoredDraft.description);
    setIsCustomisable(restoredDraft.isCustomisable ?? false);
    setMoqSets(restoredDraft.moqSets ?? "");
    setMoqUnits(restoredDraft.moqUnits ?? "");
    setShipsFrom(restoredDraft.shipsFrom ?? "");
    setSetPurchaseMode(restoredDraft.setPurchaseMode ?? "custom_mix_match");
    if (restoredDraft.variantPricing) setVariantPricing(restoredDraft.variantPricing);
    setExcludedCells(new Set(restoredDraft.excludedCells ?? []));
    setB2bMinOrderQty(restoredDraft.b2bMinOrderQty ?? "");
    setB2bMaxOrderQty(restoredDraft.b2bMaxOrderQty ?? "");
    setB2cMinOrderQty(restoredDraft.b2cMinOrderQty ?? "");
    setB2cMaxOrderQty(restoredDraft.b2cMaxOrderQty ?? "");
    setShowRestorePrompt(false);
    setRestoredDraft(null);
  };

  const handleDiscardDraft = () => {
    try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
    setShowRestorePrompt(false);
    setRestoredDraft(null);
  };

  // "Kids" is deliberately excluded from the Seller Portal's gender picker —
  // sellers targeting kids' products already select it via Category, and
  // Unisex covers the common-gender case. This is a Seller Portal UI-only
  // exclusion; the taxonomy manifest itself is untouched (Admin/Buyer
  // surfaces, if any, keep seeing the full gender list).
  const genderOptions = (manifest?.genders ?? [])
    .filter((g) => g.code !== "kids")
    .map((g) => ({ label: g.label, value: g.code }));
  const categoryOptions = manifest ? categoriesForGender(manifest, gender) : [];
  const categorySelectOptions = categoryOptions.map((c) => ({ label: c.name, value: c.slug }));
  const subcategoryOptions = manifest ? subcategoriesFor(manifest, categorySlug, gender) : [];
  const subcategorySelectOptions = subcategoryOptions.map((s) => ({ label: s.name, value: s.slug }));
  const template = manifest ? templateFor(manifest, subcategorySlug) : { required: [], optional: [] };
  const attributeSlugs = useMemo(
    () => Array.from(new Set([...template.required, ...template.optional])),
    [template.required, template.optional]
  );
  const colorSelectOptions = manifest
    ? colorAttributeValues(manifest).map((v) => ({ label: v.name, value: v.name }))
    : [];
  const tagGroups = manifest ? tagsByGroup(manifest) : {};
  const inventorySelectOptions = SELECTABLE_PRODUCT_INVENTORY_TYPES.map((value) => ({
    label: PRODUCT_INVENTORY_TYPE_LABELS[value],
    value,
  }));

  const addFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);
    const currentCount = imagesRef.current.length + existingImagesRef.current.length;
    const remaining = MAX_IMAGES - currentCount;
    if (remaining <= 0) {
      toast.error("Maximum 5 images allowed.");
      return;
    }
    const toAdd = list.slice(0, remaining);
    if (list.length > remaining) {
      toast.error(`Maximum 5 images allowed. Only ${remaining} more image${remaining === 1 ? "" : "s"} can be added.`);
    }
    for (const file of toAdd) {
      if (!ACCEPT_IMAGES.includes(file.type)) {
        toast.error(`${file.name}: Only JPG/PNG formats supported.`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`${file.name}: File exceeds 2MB size limit.`);
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

  /** Legacy products have no size-chart/manifest validation — any non-empty,
   * comma-free label is accepted (see legacy_sizes on ProductUpdate). */
  const addLegacySize = () => {
    const size = legacySizeInput.trim();
    if (!size) return;
    if (size.includes(",")) {
      toast.error("Size names can't contain commas.");
      return;
    }
    if (selectedSizes.has(size)) {
      toast.info("Size already added");
      return;
    }
    setSelectedSizes((prev) => new Set(prev).add(size));
    setLegacySizeInput("");
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

  /** Removing a color drops every variant row for it immediately — the
   * variant-matrix effect below already rebuilds `variantPricing` from
   * `selectedColors` × `selectedSizes`, so this just needs to update the
   * source-of-truth color list and prune any now-orphaned exclusions. */
  const removeColor = (color: string) => {
    setSelectedColors((prev) => prev.filter((c) => c !== color));
    setExcludedCells((prev) => {
      const next = new Set(prev);
      for (const key of next) {
        if (key.startsWith(`${color} `)) next.delete(key);
      }
      return next;
    });
  };

  const handleVariantSave = async (variantId: string) => {
    if (!initialProduct) return;
    setSavingVariantId(variantId);
    const edit = variantEdits[variantId];
    try {
      await updateProductVariant(initialProduct.id, variantId, {
        b2c_price: edit.b2c_price ? parseFloat(edit.b2c_price) : undefined,
        b2b_price: edit.b2b_price ? parseFloat(edit.b2b_price) : undefined,
        available_qty: edit.quantity ? parseInt(edit.quantity, 10) : undefined,
      });
      toast.success("Variant updated.");
    } catch {
      toast.error("Failed to update variant.");
    } finally {
      setSavingVariantId(null);
    }
  };

  const hasQtyRangeInput = minQty > 0 || maxQty > 0;
  const qtyRangeInvalid = hasQtyRangeInput && maxQty <= minQty;

  const b2bOrderQtyRangeInvalid =
    b2bMinOrderQty !== "" && b2bMaxOrderQty !== "" &&
    parseInt(b2bMaxOrderQty, 10) < parseInt(b2bMinOrderQty, 10);
  const b2cOrderQtyRangeInvalid =
    b2cMinOrderQty !== "" && b2cMaxOrderQty !== "" &&
    parseInt(b2cMaxOrderQty, 10) < parseInt(b2cMinOrderQty, 10);

  const isCellExcluded = useCallback(
    (color: string, size: string) => excludedCells.has(`${color} ${size}`),
    [excludedCells]
  );
  const toggleCellExclusion = (color: string, size: string) => {
    setExcludedCells((prev) => {
      const key = `${color} ${size}`;
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const includedVariantRows = useMemo(
    () => variantPricing.filter((row) => !isCellExcluded(row.color, row.size)),
    [variantPricing, isCellExcluded]
  );

  const variantPricingValid = useMemo(() => {
    if (includedVariantRows.length === 0) return true;
    return includedVariantRows.every((row) => {
      const b2cOk = channels === "b2b" || (row.b2c_price.trim() !== "" && !isNaN(parseFloat(row.b2c_price)));
      const b2bOk = channels === "b2c" || (row.b2b_price.trim() !== "" && !isNaN(parseFloat(row.b2b_price)));
      return b2cOk && b2bOk;
    });
  }, [includedVariantRows, channels]);

  /**
   * True only once the seller has actually changed which color × size cells exist — by adding
   * a color or size, or by unchecking a row in the variant matrix. The update payload then
   * carries a `variants` section; while the included cells still match the product's saved
   * variants, `variants` is omitted so a routine edit (name, prices, stock, images) never
   * resubmits — and never rebuilds — the variant matrix. Legacy products are excluded: they
   * edit sizes through `legacy_sizes` instead.
   */
  const variantSelectionChanged = useMemo(() => {
    if (!isEditMode || isLegacy) return false;
    const saved = new Set(
      productVariants.filter((v) => v.color && v.size).map((v) => `${v.color} ${v.size}`)
    );
    const current = includedVariantRows.map((r) => `${r.color} ${r.size}`);
    return current.length !== saved.size || current.some((key) => !saved.has(key));
  }, [isEditMode, isLegacy, productVariants, includedVariantRows]);

  const requiredAttributesFilled = useMemo(() => {
    if (isEditMode || isLegacy) return true;
    return template.required.every((slug) => (attributeSelections[slug]?.length ?? 0) > 0);
  }, [isEditMode, isLegacy, template.required, attributeSelections]);

  const isFormValid = useMemo(
    () =>
      productName.trim().length > 0 &&
      articleNumber.trim().length > 0 &&
      (isEditMode || Boolean(gender)) &&
      (isEditMode || Boolean(categorySlug)) &&
      (isEditMode || Boolean(subcategorySlug)) &&
      Boolean(inventoryType) &&
      Boolean(mrp) &&
      variantPricingValid &&
      selectedColors.length > 0 &&
      selectedSizes.size > 0 &&
      includedVariantRows.length > 0 &&
      (images.length > 0 || (isEditMode && existingImages.length > 0)) &&
      description.trim().length > 0 &&
      requiredAttributesFilled &&
      !qtyRangeInvalid &&
      !b2bOrderQtyRangeInvalid &&
      !b2cOrderQtyRangeInvalid,
    [productName, articleNumber, gender, categorySlug, subcategorySlug, inventoryType, mrp, selectedColors, selectedSizes, includedVariantRows, images, existingImages, isEditMode, description, qtyRangeInvalid, b2bOrderQtyRangeInvalid, b2cOrderQtyRangeInvalid, variantPricingValid, requiredAttributesFilled]
  );

  /** Builds the ProductDefinitionUpdate section — never includes
   * category_slug/subcategory_slug/gender/inventory_type/set_purchase_mode
   * (immutable after publish, and reassigning them requires the full
   * attributes+variants resubmission this form doesn't support). Attributes
   * and tags are only sent for non-legacy products — legacy products have no
   * Saleor attributes to edit (backend rejects it outright). */
  function buildProductUpdateSection() {
    return {
      name: productName.trim(),
      description: description.trim() || undefined,
      article_number: articleNumber.trim() || undefined,
      is_customisable: isCustomisable,
      ships_from: shipsFrom.trim() || undefined,
      moq_sets: moqSets ? parseInt(moqSets, 10) : undefined,
      moq_units: moqUnits ? parseInt(moqUnits, 10) : undefined,
      min_quantity_per_set: minQty > 0 ? minQty : undefined,
      max_quantity_per_set: maxQty > 0 ? maxQty : undefined,
      b2b_min_order_qty: b2bMinOrderQty ? parseInt(b2bMinOrderQty, 10) : undefined,
      b2b_max_order_qty: b2bMaxOrderQty ? parseInt(b2bMaxOrderQty, 10) : undefined,
      b2c_min_order_qty: b2cMinOrderQty ? parseInt(b2cMinOrderQty, 10) : undefined,
      b2c_max_order_qty: b2cMaxOrderQty ? parseInt(b2cMaxOrderQty, 10) : undefined,
      ...(isLegacy ? {} : { attributes: attributeSelections, tags: tagSlugs }),
    };
  }

  /** Shared pricing/inventory broadcast sections for edit-mode updates —
   * identical between Save Draft and Publish/Update, so both call sites
   * build from here rather than duplicating the same object literal. */
  function buildPricingUpdateSection() {
    return {
      mrp: mrp ? parseFloat(mrp) : undefined,
      channels,
      overrides: includedVariantRows
        .filter((r) => r.b2c_price || r.b2b_price)
        .map((r) => ({
          color: r.color,
          size: r.size,
          b2c_price: r.b2c_price ? parseFloat(r.b2c_price) : undefined,
          b2b_price: r.b2b_price ? parseFloat(r.b2b_price) : undefined,
        })),
    };
  }

  function buildInventoryUpdateSection() {
    return {
      overrides: includedVariantRows
        .filter((r) => r.qty)
        .map((r) => ({ color: r.color, size: r.size, available_qty: parseInt(r.qty, 10) })),
    };
  }

  /** Create-time ProductDefinition — shared between Save Draft and Publish,
   * which submit the exact same taxonomy/attribute/tag fields. */
  function buildCreateProductDefinition(description: string) {
    return {
      name: productName.trim(),
      description,
      category_slug: categorySlug!,
      subcategory_slug: subcategorySlug!,
      gender: gender!,
      inventory_type: inventoryType!,
      is_customisable: isCustomisable,
      article_number: articleNumber.trim() || undefined,
      moq_sets: moqSets ? parseInt(moqSets, 10) : undefined,
      moq_units: moqUnits ? parseInt(moqUnits, 10) : undefined,
      ships_from: shipsFrom.trim() || undefined,
      attributes: attributeSelections,
      tags: tagSlugs,
      set_purchase_mode: setPurchaseMode,
      min_quantity_per_set: minQty > 0 ? minQty : undefined,
      max_quantity_per_set: maxQty > 0 ? maxQty : undefined,
      b2b_min_order_qty: b2bMinOrderQty ? parseInt(b2bMinOrderQty, 10) : undefined,
      b2b_max_order_qty: b2bMaxOrderQty ? parseInt(b2bMaxOrderQty, 10) : undefined,
      b2c_min_order_qty: b2cMinOrderQty ? parseInt(b2cMinOrderQty, 10) : undefined,
      b2c_max_order_qty: b2cMaxOrderQty ? parseInt(b2cMaxOrderQty, 10) : undefined,
    };
  }

  /** Create-time VariantConfiguration — every selected color gets the same
   * shared image pool and size list (see AddProductClient's color/size
   * sections: this form doesn't offer per-color sizes/images). */
  /** Excludes any Color × Size cell the seller unchecked in the variant
   * matrix — only valid variants are ever submitted. A color left with zero
   * included sizes after exclusion is dropped entirely (sellers should use
   * "remove color" for that anyway, but this stays defensive). */
  function buildCreateVariantConfiguration(imageUrls: string[]) {
    return {
      colors: selectedColors
        .map((color) => ({
          color,
          images: imageUrls,
          sizes: [...selectedSizes].filter((size) => !isCellExcluded(color, size)),
        }))
        .filter((c) => c.sizes.length > 0),
    };
  }

  /** Same shape as the create-time configuration, but falls back to the product's
   * already-saved image URLs when the seller didn't upload new ones — passing an
   * empty `images` array would detach the existing images from every color. */
  function buildUpdateVariantConfiguration(newImageUrls: string[]) {
    return buildCreateVariantConfiguration(
      newImageUrls.length > 0 ? newImageUrls : existingImages.map((img) => img.url)
    );
  }

  const handleSaveDraft = async () => {
    if (isSubmitting) return;
    if (productId && !initialProduct) {
      toast.error(
        isFetchingProduct
          ? "Product is still loading, please wait a moment."
          : "Failed to load product. Please refresh the page."
      );
      return;
    }
    if (!productName.trim()) {
      toast.error("Product name is required to save a draft.");
      return;
    }
    if (!isEditMode && (!categorySlug || !subcategorySlug || !gender)) {
      toast.error("Gender, category, and subcategory are required to save a draft.");
      return;
    }
    if (!inventoryType) {
      toast.error("Inventory type is required to save a draft.");
      return;
    }
    // Drafts accept blank variant prices — only reject ones already entered above MRP.
    if (mrp) {
      const mrpNum = parseFloat(mrp);
      if (!isNaN(mrpNum) && mrpNum > 0) {
        for (const row of includedVariantRows) {
          const label = `${row.color} / ${row.size}`;
          const b2c = parseFloat(row.b2c_price);
          if (channels !== "b2b" && row.b2c_price && !isNaN(b2c) && b2c > mrpNum) {
            toast.error(`B2C price for "${label}" cannot exceed MRP`);
            return;
          }
          const b2b = parseFloat(row.b2b_price);
          if (channels !== "b2c" && row.b2b_price && !isNaN(b2b) && b2b > mrpNum) {
            toast.error(`B2B price for "${label}" cannot exceed MRP`);
            return;
          }
        }
      }
    }

    setIsSubmitting(true);
    try {
      const imageUrls = images.length > 0
        ? await uploadImagesToStorage(images.map((i) => i.file))
        : [];
      const draftDescription = description.trim() || productName.trim();
      if (isEditMode && initialProduct) {
        await updateProduct(initialProduct.id, {
          product: { ...buildProductUpdateSection(), description: draftDescription },
          variants: variantSelectionChanged
            ? buildUpdateVariantConfiguration(imageUrls)
            : undefined,
          pricing: buildPricingUpdateSection(),
          inventory: buildInventoryUpdateSection(),
          images: imageUrls.length > 0 ? imageUrls : undefined,
          legacy_sizes: isLegacy ? [...selectedSizes] : undefined,
        });
        toast.success("Draft updated successfully.");
      } else {
        if (!pendingProductIdRef.current) {
          const created = await createProduct({
            product: buildCreateProductDefinition(draftDescription),
            variants: buildCreateVariantConfiguration(imageUrls),
            pricing: {
              mrp: mrp ? parseFloat(mrp) : undefined,
              channels,
              overrides: includedVariantRows
                .filter((r) => r.b2c_price || r.b2b_price)
                .map((r) => ({
                  color: r.color,
                  size: r.size,
                  b2c_price: r.b2c_price ? parseFloat(r.b2c_price) : undefined,
                  b2b_price: r.b2b_price ? parseFloat(r.b2b_price) : undefined,
                })),
            },
            inventory: {
              overrides: includedVariantRows
                .filter((r) => r.qty)
                .map((r) => ({ color: r.color, size: r.size, available_qty: parseInt(r.qty, 10) })),
            },
          });
          pendingProductIdRef.current = created.product_id;
          if (created.images_failed) {
            toast.warning(`${created.images_failed} image(s) failed to attach. You can re-upload them after editing.`);
          }
        }
        toast.success("Draft saved successfully.");
      }
      submittedRef.current = true;
      try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
      router.push("/product-listing");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save draft.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productId && !initialProduct) {
      toast.error(
        isFetchingProduct
          ? "Product is still loading, please wait a moment."
          : "Failed to load product. Please refresh the page."
      );
      return;
    }
    if (!productName.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!articleNumber.trim()) {
      toast.error("Article number is required");
      return;
    }
    if (!isEditMode) {
      if (!gender) {
        toast.error("Gender is required");
        return;
      }
      if (!categorySlug) {
        toast.error("Category is required");
        return;
      }
      if (!subcategorySlug) {
        toast.error("Subcategory is required");
        return;
      }
      if (!requiredAttributesFilled) {
        toast.error("Please fill in all required attributes");
        return;
      }
    }
    if (!inventoryType) {
      toast.error("Inventory type is required");
      return;
    }
    if (images.length === 0 && !(isEditMode && existingImages.length > 0)) {
      toast.error("At least one image is required");
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
    if (includedVariantRows.length === 0) {
      toast.error("At least one color/size combination must be included");
      return;
    }
    if (qtyRangeInvalid) {
      toast.error("Maximum quantity must be greater than minimum quantity");
      return;
    }
    if (b2bOrderQtyRangeInvalid) {
      toast.error("B2B max order qty must be greater than or equal to min order qty");
      return;
    }
    if (b2cOrderQtyRangeInvalid) {
      toast.error("B2C max order qty must be greater than or equal to min order qty");
      return;
    }
    if (!mrp.trim()) {
      toast.error("MRP is required");
      return;
    }
    const mrpNum = parseFloat(mrp);
    if (isNaN(mrpNum) || mrpNum <= 0) {
      toast.error("Enter a valid MRP");
      return;
    }
    for (const row of includedVariantRows) {
      const label = `${row.color} / ${row.size}`;
      if (channels !== "b2b") {
        const b2c = parseFloat(row.b2c_price);
        if (!row.b2c_price.trim() || isNaN(b2c) || b2c <= 0) {
          toast.error(`Enter a valid B2C price for "${label}"`);
          return;
        }
        if (b2c > mrpNum) {
          toast.error(`B2C price for "${label}" cannot exceed MRP`);
          return;
        }
      }
      if (channels !== "b2c") {
        const b2b = parseFloat(row.b2b_price);
        if (!row.b2b_price.trim() || isNaN(b2b) || b2b <= 0) {
          toast.error(`Enter a valid B2B price for "${label}"`);
          return;
        }
        if (b2b > mrpNum) {
          toast.error(`B2B price for "${label}" cannot exceed MRP`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    // Publishing lands on the new product's detail page; editing returns to the list.
    let redirectTo = "/product-listing";
    try {
      const imageUrls = images.length > 0
        ? await uploadImagesToStorage(images.map((i) => i.file))
        : [];

      if (isEditMode && initialProduct) {
        await updateProduct(initialProduct.id, {
          product: buildProductUpdateSection(),
          variants: variantSelectionChanged
            ? buildUpdateVariantConfiguration(imageUrls)
            : undefined,
          pricing: buildPricingUpdateSection(),
          inventory: buildInventoryUpdateSection(),
          images: imageUrls.length > 0 ? imageUrls : undefined,
          legacy_sizes: isLegacy ? [...selectedSizes] : undefined,
        });
        toast.success("Product updated successfully.");
      } else {
        // If a previous attempt created the product but publish failed,
        // reuse the existing product_id instead of creating a duplicate.
        let productIdToPublish = pendingProductIdRef.current;
        if (!productIdToPublish) {
          const created = await createProduct({
            product: buildCreateProductDefinition(description.trim() || productName.trim()),
            variants: buildCreateVariantConfiguration(imageUrls),
            pricing: {
              mrp: mrpNum,
              channels,
              overrides: includedVariantRows.map((r) => ({
                color: r.color,
                size: r.size,
                b2c_price: r.b2c_price ? parseFloat(r.b2c_price) : undefined,
                b2b_price: r.b2b_price ? parseFloat(r.b2b_price) : undefined,
              })),
            },
            inventory: {
              overrides: includedVariantRows.map((r) => ({
                color: r.color,
                size: r.size,
                available_qty: r.qty ? parseInt(r.qty, 10) : 0,
              })),
            },
          });
          pendingProductIdRef.current = created.product_id;
          productIdToPublish = created.product_id;
          if (created.images_failed) {
            toast.warning(`${created.images_failed} image(s) failed to attach. You can re-upload them after editing.`);
          }
        }
        await publishProduct(productIdToPublish);
        toast.success("Product published successfully.");
        redirectTo = `/product-listing/${encodeURIComponent(productIdToPublish)}`;
      }
      submittedRef.current = true;
      try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
      router.push(redirectTo);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
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

      {showRestorePrompt && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>A saved draft was found. Would you like to restore it?</span>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="rounded bg-amber-700 px-3 py-1 text-xs font-medium text-white hover:bg-amber-800"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="rounded px-3 py-1 text-xs font-medium hover:bg-amber-100"
            >
              Discard
            </button>
          </div>
        </div>
      )}
      <form id="add-product-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            {isEditMode && existingImages.length > 0 && (
              <div className="rounded-lg border bg-white p-4 shadow-sm space-y-3">
                <p className="text-sm font-medium">Saved Images ({existingImages.length})</p>
                <ul className="flex flex-wrap gap-3">
                  {existingImages.map((img, index) => (
                    <li key={img.id} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                      {index === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[9px] font-medium leading-none text-white">
                          Primary
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <ProductImageUploadCard
              fileInputRef={fileInputRef}
              onFilesAdded={addFiles}
              uploadedImages={images}
              onRemoveImage={removeImage}
              onReorder={(newOrder) => setImages((prev) => newOrder.map(({ id }) => prev.find((img) => img.id === id)!).filter(Boolean))}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              maxFileSizeLabel="2 MB."
            />
          </div>

          <Card className="border bg-white shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-normal">
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
                  Gender {!isEditMode && <RequiredMark />}
                </span>
                {isEditMode ? (
                  <LockedField value={gender ?? ""} />
                ) : (
                  <AppSelect
                    className="w-full min-w-0 bg-white text-foreground data-[placeholder]:text-muted-foreground"
                    placeholder="Select gender."
                    value={gender}
                    onChange={(v) => { setGender(v); setCategorySlug(undefined); setSubcategorySlug(undefined); }}
                    options={genderOptions}
                  />
                )}
              </div>
              <div className="space-y-3">
                <span className="text-sm font-medium">
                  Category {!isEditMode && <RequiredMark />}
                </span>
                {isEditMode ? (
                  <LockedField value={initialProduct?.categoryName ?? ""} />
                ) : (
                  <AppSelect
                    className="w-full min-w-0 bg-white text-foreground data-[placeholder]:text-muted-foreground"
                    placeholder={gender ? "Select category." : "Select gender first."}
                    value={categorySlug}
                    onChange={(v) => { setCategorySlug(v); setSubcategorySlug(undefined); }}
                    options={categorySelectOptions}
                  />
                )}
              </div>
              {!isEditMode && (
                <div className="space-y-3">
                  <span className="text-sm font-medium">
                    Subcategory <RequiredMark />
                  </span>
                  <AppSelect
                    className="w-full min-w-0 bg-white text-foreground data-[placeholder]:text-muted-foreground"
                    placeholder={categorySlug ? "Select subcategory." : "Select category first."}
                    value={subcategorySlug}
                    onChange={(v) => setSubcategorySlug(v)}
                    options={subcategorySelectOptions}
                  />
                </div>
              )}
              <div className="space-y-3">
                <span className="text-sm font-medium">
                  Inventory Type {!isEditMode && <RequiredMark />}
                </span>
                {isEditMode ? (
                  <LockedField
                    value={
                      inventoryType
                        ? PRODUCT_INVENTORY_TYPE_LABELS[inventoryType as ProductInventoryType]
                        : ""
                    }
                  />
                ) : (
                  <AppSelect
                    className="w-full min-w-0 bg-white text-foreground data-[placeholder]:text-muted-foreground"
                    placeholder="Select Inventory type."
                    value={inventoryType}
                    onChange={(v) => setInventoryType(v)}
                    options={inventorySelectOptions}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {!isEditMode && !isLegacy && subcategorySlug && attributeSlugs.length > 0 && (
          <Card className="border bg-white shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-normal">Attributes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
              {attributeSlugs.map((slug) => {
                const attr = manifest ? attributeBySlug(manifest, slug) : undefined;
                if (!attr) return null;
                const required = template.required.includes(slug);
                return (
                  <div key={slug} className="space-y-2">
                    <span className="text-sm font-medium">
                      {attr.name} {required && <RequiredMark />}
                    </span>
                    <MultiSelectFilter
                      placeholder={`Select ${attr.name.toLowerCase()}`}
                      options={attr.values.map((v) => ({ label: v.name, value: v.name }))}
                      selected={attributeSelections[slug] ?? []}
                      onChange={(vals) =>
                        setAttributeSelections((prev) => ({ ...prev, [slug]: vals }))
                      }
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border bg-white shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-normal">
                Size Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {isLegacy ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    This is a legacy product — it predates the taxonomy system, so sizes
                    aren&apos;t validated against a size chart. Add or remove sizes below.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. M"
                      value={legacySizeInput}
                      onChange={(e) => setLegacySizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addLegacySize();
                        }
                      }}
                      className="max-w-[160px] bg-white"
                    />
                    <Button type="button" variant="secondary" onClick={addLegacySize}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...selectedSizes].map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        {s}
                        <button
                          type="button"
                          className="rounded p-0.5 hover:bg-background"
                          aria-label={`Remove ${s}`}
                          onClick={() => toggleSize(s)}
                        >
                          <span className="text-muted-foreground">×</span>
                        </button>
                      </span>
                    ))}
                    {selectedSizes.size === 0 && (
                      <span className="text-xs text-muted-foreground">No sizes yet</span>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {isEditMode && (
                    <p className="text-xs text-muted-foreground">
                      Changing the selected sizes rebuilds this product&apos;s color × size
                      variants when you save. Prices and stock for new combinations start empty —
                      set them in Variant Pricing &amp; Stock after saving.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        {gender && categorySlug ? "Loading sizes…" : "Select gender and category to see available sizes."}
                      </span>
                    ) : (
                      sizeOptions.map((size) => {
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
                      })
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">Selected Sizes :</p>
                    <div className="flex flex-wrap gap-2">
                      {[...selectedSizes].sort((a, b) => sizeOptions.indexOf(a) - sizeOptions.indexOf(b)).map((s) => (
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
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border bg-white shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-normal">
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
                    options={colorSelectOptions}
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
                    selectedColors.map((color) => (
                      <span
                        key={color}
                        className="inline-flex items-center gap-2 rounded-xs bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        {color}
                        <button
                          type="button"
                          className="rounded p-0.5 hover:bg-background"
                          aria-label={`Remove ${color}`}
                          onClick={() => removeColor(color)}
                        >
                          <span className="text-muted-foreground">×</span>
                        </button>
                      </span>
                    ))
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
                Pricing &amp; Quantity
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
              <div className="space-y-3 sm:col-span-2">
                <span className="text-sm font-medium">List on <RequiredMark /></span>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { value: "both", label: "B2C & B2B" },
                      { value: "b2c", label: "B2C only" },
                      { value: "b2b", label: "B2B only" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setChannels(opt.value)}
                      className={cn(
                        "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                        channels === opt.value
                          ? "border-[#122130] bg-[#122130] text-white"
                          : "border-border bg-white text-foreground hover:bg-muted"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label htmlFor="mrp" className="text-sm font-medium">
                  MRP (₹) <RequiredMark />
                </label>
                <Input
                  id="mrp"
                  inputMode="decimal"
                  placeholder="Enter MRP."
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  className="bg-white"
                />
              </div>
              {variantPricing.length > 0 ? (
                <div className="space-y-3 sm:col-span-2">
                  <p className="text-sm font-medium">
                    Variant Pricing <RequiredMark />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isEditMode
                      ? "Unchecked rows are color/size combinations this product doesn't have. Check one to add it; uncheck an existing row to remove that combination."
                      : "Uncheck a row to exclude that color/size combination — it won't be created."}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-2 pr-3 font-medium">Included</th>
                          <th className="pb-2 pr-3 font-medium">Color</th>
                          <th className="pb-2 pr-3 font-medium">Size</th>
                          {channels !== "b2b" && <th className="pb-2 pr-3 font-medium">B2C Price (₹)</th>}
                          {channels !== "b2c" && <th className="pb-2 pr-3 font-medium">B2B Price (₹)</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {variantPricing.map((row, idx) => {
                          const excluded = isCellExcluded(row.color, row.size);
                          return (
                          <tr
                            key={`${row.color} ${row.size}`}
                            className={cn("border-b last:border-0", excluded && "opacity-40")}
                          >
                            <td className="py-2 pr-3">
                              <input
                                type="checkbox"
                                checked={!excluded}
                                aria-label={`Include ${row.color} ${row.size}`}
                                onChange={() => toggleCellExclusion(row.color, row.size)}
                                className="h-4 w-4 rounded border-input"
                              />
                            </td>
                            <td className="py-2 pr-3 text-xs font-medium">{row.color}</td>
                            <td className="py-2 pr-3 text-xs font-medium">{row.size}</td>
                            {channels !== "b2b" && (
                              <td className="py-2 pr-3">
                                <Input
                                  inputMode="decimal"
                                  placeholder="0.00"
                                  disabled={excluded}
                                  value={row.b2c_price}
                                  onChange={(e) =>
                                    setVariantPricing((prev) =>
                                      prev.map((r, i) => i === idx ? { ...r, b2c_price: e.target.value } : r)
                                    )
                                  }
                                  className="h-8 w-24 bg-white"
                                />
                              </td>
                            )}
                            {channels !== "b2c" && (
                              <td className="py-2 pr-3">
                                <Input
                                  inputMode="decimal"
                                  placeholder="0.00"
                                  disabled={excluded}
                                  value={row.b2b_price}
                                  onChange={(e) =>
                                    setVariantPricing((prev) =>
                                      prev.map((r, i) => i === idx ? { ...r, b2b_price: e.target.value } : r)
                                    )
                                  }
                                  className="h-8 w-24 bg-white"
                                />
                              </td>
                            )}
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  Select colors and sizes above to configure per-variant pricing.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border bg-white shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-normal">
                Set Purchase &amp; Customisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="space-y-3">
                <span className="text-sm font-medium">Set Purchase Mode</span>
                {isEditMode ? (
                  <LockedField
                    value={SET_PURCHASE_MODE_OPTIONS.find((o) => o.value === setPurchaseMode)?.label ?? ""}
                  />
                ) : (
                  <AppSelect
                    className="w-full min-w-0 bg-white text-foreground data-[placeholder]:text-muted-foreground"
                    placeholder="Select set purchase mode."
                    value={setPurchaseMode}
                    onChange={(v) => setSetPurchaseMode(v as SetPurchaseMode)}
                    options={SET_PURCHASE_MODE_OPTIONS}
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="is-customisable"
                  type="checkbox"
                  checked={isCustomisable}
                  onChange={(e) => setIsCustomisable(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <label htmlFor="is-customisable" className="text-sm font-medium">
                  Customisable product
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <label htmlFor="moq-sets" className="text-sm font-medium">MOQ (Sets)</label>
                  <Input
                    id="moq-sets"
                    inputMode="numeric"
                    placeholder="e.g. 10"
                    value={moqSets}
                    onChange={(e) => setMoqSets(e.target.value.replace(/\D/g, ""))}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <label htmlFor="moq-units" className="text-sm font-medium">MOQ (Units)</label>
                  <Input
                    id="moq-units"
                    inputMode="numeric"
                    placeholder="e.g. 50"
                    value={moqUnits}
                    onChange={(e) => setMoqUnits(e.target.value.replace(/\D/g, ""))}
                    className="bg-white"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label htmlFor="ships-from" className="text-sm font-medium">Ships From</label>
                <Input
                  id="ships-from"
                  placeholder="e.g. Tiruppur, Tamil Nadu"
                  value={shipsFrom}
                  onChange={(e) => setShipsFrom(e.target.value)}
                  className="bg-white"
                />
              </div>

              {/* Minimum/Maximum Quantity — business ordering policy, kept
                  separately per channel (never a stock split; one physical
                  inventory pool). Only the section(s) matching the selected
                  channel(s) render, so B2B and B2C limits can never be
                  confused with each other. */}
              <div className="space-y-4 border-t pt-4">
                <span className="text-sm font-medium">Minimum / Maximum Quantity</span>
                {(channels === "b2b" || channels === "both") && (
                  <div className="space-y-3 rounded-md border border-purple-200 bg-purple-50/40 p-3">
                    <span className="inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                      B2B
                    </span>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="b2b-min-order-qty" className="text-xs font-medium text-muted-foreground">
                          Minimum Quantity
                        </label>
                        <Input
                          id="b2b-min-order-qty"
                          inputMode="numeric"
                          placeholder="e.g. 10"
                          value={b2bMinOrderQty}
                          onChange={(e) => setB2bMinOrderQty(e.target.value.replace(/\D/g, ""))}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="b2b-max-order-qty" className="text-xs font-medium text-muted-foreground">
                          Maximum Quantity
                        </label>
                        <Input
                          id="b2b-max-order-qty"
                          inputMode="numeric"
                          placeholder="e.g. 500"
                          value={b2bMaxOrderQty}
                          onChange={(e) => setB2bMaxOrderQty(e.target.value.replace(/\D/g, ""))}
                          className="bg-white"
                        />
                      </div>
                    </div>
                    {b2bOrderQtyRangeInvalid && (
                      <p className="text-xs text-destructive" role="alert">
                        B2B max order qty must be greater than or equal to min order qty.
                      </p>
                    )}
                  </div>
                )}
                {(channels === "b2c" || channels === "both") && (
                  <div className="space-y-3 rounded-md border border-blue-200 bg-blue-50/40 p-3">
                    <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      B2C
                    </span>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="b2c-min-order-qty" className="text-xs font-medium text-muted-foreground">
                          Minimum Quantity
                        </label>
                        <Input
                          id="b2c-min-order-qty"
                          inputMode="numeric"
                          placeholder="e.g. 1"
                          value={b2cMinOrderQty}
                          onChange={(e) => setB2cMinOrderQty(e.target.value.replace(/\D/g, ""))}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="b2c-max-order-qty" className="text-xs font-medium text-muted-foreground">
                          Maximum Quantity
                        </label>
                        <Input
                          id="b2c-max-order-qty"
                          inputMode="numeric"
                          placeholder="e.g. 20"
                          value={b2cMaxOrderQty}
                          onChange={(e) => setB2cMaxOrderQty(e.target.value.replace(/\D/g, ""))}
                          className="bg-white"
                        />
                      </div>
                    </div>
                    {b2cOrderQtyRangeInvalid && (
                      <p className="text-xs text-destructive" role="alert">
                        B2C max order qty must be greater than or equal to min order qty.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {!isLegacy && (
          <Card className="border bg-white shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-normal">
                Product Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {Object.entries(tagGroups).length === 0 ? (
                <p className="text-xs text-muted-foreground">Loading tags…</p>
              ) : (
                Object.entries(tagGroups).map(([group, groupTags]) => (
                  <div key={group} className="space-y-2">
                    <span className="text-sm font-medium capitalize">{group}</span>
                    <MultiSelectFilter
                      placeholder={`Select ${group} tags`}
                      options={groupTags.map((t) => ({ label: t.name, value: t.slug }))}
                      selected={tagSlugs.filter((slug) => groupTags.some((t) => t.slug === slug))}
                      onChange={(vals) =>
                        setTagSlugs((prev) => [
                          ...prev.filter((slug) => !groupTags.some((t) => t.slug === slug)),
                          ...vals,
                        ])
                      }
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border bg-white shadow-sm">
          <CardHeader className="border-b pb-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-normal">
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

      {isEditMode && productVariants.length > 0 && (
        <Card className="border bg-white shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-normal">Variant Pricing &amp; Stock</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Color</th>
                    <th className="pb-2 pr-4 font-medium">Size</th>
                    <th className="pb-2 pr-4 font-medium">B2C Price (₹)</th>
                    <th className="pb-2 pr-4 font-medium">B2B Price (₹)</th>
                    <th className="pb-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {productVariants.map((variant) => {
                    const edit = variantEdits[variant.id] ?? { b2c_price: "", b2b_price: "", quantity: "" };
                    return (
                      <tr key={variant.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium">{variant.color ?? "—"}</td>
                        <td className="py-2 pr-4 font-medium">{variant.size ?? "Default"}</td>
                        <td className="py-2 pr-4">
                          <Input
                            inputMode="decimal"
                            value={edit.b2c_price}
                            onChange={(e) =>
                              setVariantEdits((prev) => ({
                                ...prev,
                                [variant.id]: { ...edit, b2c_price: e.target.value },
                              }))
                            }
                            className="h-8 w-24 bg-white"
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <Input
                            inputMode="decimal"
                            value={edit.b2b_price}
                            onChange={(e) =>
                              setVariantEdits((prev) => ({
                                ...prev,
                                [variant.id]: { ...edit, b2b_price: e.target.value },
                              }))
                            }
                            className="h-8 w-24 bg-white"
                          />
                        </td>
                        <td className="py-2">
                          <Button
                            type="button"
                            size="sm"
                            className="h-8 bg-[#122130] text-xs hover:bg-[#0d1a28]"
                            disabled={savingVariantId === variant.id}
                            onClick={() => handleVariantSave(variant.id)}
                          >
                            {savingVariantId === variant.id ? "Saving…" : "Save"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting || isFetchingProduct}
          onClick={handleSaveDraft}
        >
          {isSubmitting ? "Saving…" : "Save as Draft"}
        </Button>
        <Button
          type="submit"
          form="add-product-form"
          disabled={isSubmitting || isFetchingProduct || !isFormValid}
          className="bg-[#122130] hover:bg-[#0d1a28]"
        >
          {isFetchingProduct
            ? "Loading…"
            : isSubmitting
              ? isEditMode ? "Updating…" : "Publishing…"
              : isEditMode ? "Update product" : "Publish product"}
        </Button>
      </div>
    </div>
  );
}
