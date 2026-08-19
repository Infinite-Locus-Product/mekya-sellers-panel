import type { ProductInventoryType } from "@/lib/tableTypes";

/** Edit-mode prefill data for AddProductClient. Taxonomy fields
 * (category/subcategory/gender/inventoryType/setPurchaseMode) are display-only
 * once a product exists — the locked backend treats them as immutable after
 * publish, and reassigning them pre-publish requires resubmitting the full
 * attribute + variant matrix together (see ProductUpdate's docstring in
 * mekya-be/backend/src/application/seller/schemas.py); that full reassignment
 * flow is out of scope here, so these fields are shown read-only in Edit mode. */
export interface EditableProductDraft {
  id: string;
  name: string;
  articleNumber: string;
  isLegacy: boolean;
  categoryName: string;
  categorySlug?: string;
  subcategorySlug?: string;
  inventoryType: ProductInventoryType;
  gender?: string;
  setPurchaseMode?: string;
  /** Legacy-only read-only display (see AddProductClient) — non-legacy
   * colors/sizes are edited via the color x size VariantMatrixEditor
   * instead, sourced directly from ProductDetail.variants.colors. */
  sizes: string[];
  colors: string[];
  /** Editable for non-legacy products only. */
  attributeSelections: Record<string, string[]>;
  tagSlugs: string[];
  mrp: string;
  minQty: number;
  maxQty: number;
  /** Channel order limits — business ordering policy, not a stock split. */
  b2bMinOrderQty?: number;
  b2bMaxOrderQty?: number;
  b2cMinOrderQty?: number;
  b2cMaxOrderQty?: number;
  isCustomisable: boolean;
  moqSets?: number;
  moqUnits?: number;
  shipsFrom?: string;
  shippingDays?: string;
  description: string;
  images?: Array<{ id: string; url: string }>;
  channels?: "b2c" | "b2b" | "both";
}
