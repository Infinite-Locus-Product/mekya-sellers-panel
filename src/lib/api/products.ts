import { authService } from "@/lib/auth/authService";
import type { ProductInventoryType, ProductRow } from "@/lib/tableTypes";

// ─── Types ────────────────────────────────────────────────────────────────────
// Mirrors the locked backend contract exactly (mekya-be/backend/src/application/seller/schemas.py).

export interface Category {
  id: string;
  name: string;
  slug: string;
}

/** A product's channel assignment. The three values are disjoint: "both" means
 * dual-listed, not "either", so they partition the catalog. */
export type ProductChannel = "b2c" | "b2b" | "both";

/** The admin's decision on a product. Null when the backend has no record for it. */
export type ProductApprovalStatus = "pending" | "approved" | "rejected";

/** New colors/sizes added to an approved product: held until an admin approves them. */
export interface ProductChangeRequest {
  status: ProductApprovalStatus;
  skus: Array<{
    sku: string | null;
    color: string | null;
    size: string | null;
    b2c_price: number | null;
    b2b_price: number | null;
  }>;
  submitted_at: string | null;
  reviewed_at: string | null;
  /** Only once rejected. */
  rejection_reason: string | null;
}

/** "Navy / M, Navy / L" — how held SKUs are described to the seller. */
export function describeSkus(skus: ProductChangeRequest["skus"]): string {
  return skus.map((s) => [s.color, s.size].filter(Boolean).join(" / ") || s.sku || "—").join(", ");
}

export interface ProductListItem {
  id: string;
  name: string;
  thumbnail_url: string | null;
  sku: string | null;
  status: "published" | "draft" | "inactive";
  article_number: string;
  category: string;
  sizes: string[];
  colors: string[];
  inventory_type: string;
  price: string;
  quantity: number;
  channels?: ProductChannel;
  approval_status?: ProductApprovalStatus | null;
  rejection_reason?: string | null;
  /** New colors/sizes on this live product are waiting for admin approval. */
  has_pending_change?: boolean;
}

export interface ProductListResponse {
  products: ProductListItem[];
  has_next: boolean;
  cursor: string | null;
  total: number;
}

/** Flat, denormalized per-variant row — `variant_list` in get_product's response,
 * and the only shape get_product_variants/update_product_variant deal in.
 * `color`/`size` are null for legacy variants (unparseable combined name). */
export interface FlatVariant {
  id: string;
  color: string | null;
  size: string | null;
  sku: string | null;
  b2c_price: number | null;
  b2b_price: number | null;
  quantity: number | null;
  /** Added to a live product and waiting for admin approval (not visible to buyers). */
  pending_approval?: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
}

export interface ColorVariantSize {
  size: string;
  variant_id: string;
  sku: string | null;
  b2c_price: number | null;
  b2b_price: number | null;
  available_qty: number | null;
  pending_approval?: boolean;
}

export interface ColorVariant {
  color: string;
  images: ProductImage[];
  sizes: ColorVariantSize[];
}

/** The non-taxonomy half of ProductDefinition, read back from metadata.
 * Populated for every product, legacy or not. */
export interface ProductDefinitionDto {
  inventory_type: string | null;
  article_number: string | null;
  is_customisable: boolean;
  moq_sets: number | null;
  moq_units: number | null;
  ships_from: string | null;
  shipping_days: string | null;
  set_purchase_mode: string | null;
  min_quantity_per_set: number | null;
  max_quantity_per_set: number | null;
  /** Channel order limits — commercial ordering policy, distinct from
   * min/max_quantity_per_set above (set_purchase_mode bundling granularity).
   * One physical inventory pool; these are business limits only. */
  b2b_min_order_qty: number | null;
  b2b_max_order_qty: number | null;
  b2c_min_order_qty: number | null;
  b2c_max_order_qty: number | null;
}

/** Only present (non-null) for non-legacy products. */
export interface ProductTaxonomyDto {
  gender: string;
  category_slug: string;
  subcategory_slug: string;
  attributes: Record<string, string[]>;
  tags: string[];
  size_chart: Record<string, Record<string, number>>;
}

/** Only present (non-null) for legacy products — the ONLY taxonomy-shaped
 * data a pre-taxonomy-migration product has. Never mix with ProductTaxonomyDto. */
export interface ProductLegacyDto {
  gender: string | null;
  colors: string[];
  sizes: string[];
  tags: string[];
}

export interface ProductDetail {
  id: string;
  name: string;
  description: string;
  category: { id: string; name: string; slug: string } | null;
  thumbnail_url: string | null;
  images: ProductImage[];
  variant_list: FlatVariant[];
  /** Color x size matrix — null for legacy products. */
  variants: { colors: ColorVariant[] } | null;
  status: "published" | "draft" | "inactive";
  approval_status?: ProductApprovalStatus | null;
  /** The admin's reason, only while the product is rejected. */
  rejection_reason?: string | null;
  /** The latest review of new colors/sizes added to this product after approval. */
  change_request?: ProductChangeRequest | null;
  metadata: Record<string, string>;
  is_legacy: boolean;
  product: ProductDefinitionDto;
  taxonomy: ProductTaxonomyDto | null;
  legacy: ProductLegacyDto | null;
}

// ─── Write-side payload types (ProductCreate / ProductUpdate) ─────────────────

export interface ProductColorInput {
  color: string;
  images: string[];
  sizes: string[];
}

export interface VariantConfigurationInput {
  colors: ProductColorInput[];
}

export interface PriceOverrideInput {
  color: string;
  size: string;
  b2c_price?: number;
  b2b_price?: number;
}

export interface StockOverrideInput {
  color: string;
  size: string;
  available_qty: number;
}

export interface PricingInput {
  selling_price?: number;
  b2b_selling_price?: number;
  mrp?: number;
  channels?: ProductChannel;
  overrides?: PriceOverrideInput[];
}

export interface InventoryInput {
  available_qty?: number;
  overrides?: StockOverrideInput[];
}

export type SetPurchaseMode = "single_size_multi_color" | "multi_size_single_color" | "custom_mix_match";

export interface ProductDefinitionInput {
  name: string;
  description: string;
  category_slug: string;
  subcategory_slug: string;
  gender: string;
  inventory_type: string;
  is_customisable?: boolean;
  article_number?: string;
  moq_sets?: number;
  moq_units?: number;
  ships_from?: string;
  shipping_days?: string;
  attributes?: Record<string, string[]>;
  tags?: string[];
  size_chart?: Record<string, Record<string, number>>;
  set_purchase_mode?: SetPurchaseMode;
  min_quantity_per_set?: number;
  max_quantity_per_set?: number;
  b2b_min_order_qty?: number;
  b2b_max_order_qty?: number;
  b2c_min_order_qty?: number;
  b2c_max_order_qty?: number;
}

export interface CreateProductPayload {
  product: ProductDefinitionInput;
  variants: VariantConfigurationInput;
  pricing?: PricingInput;
  inventory?: InventoryInput;
  /** Generic/legacy image path — attaches without linking to a color. */
  images?: string[];
}

export interface ProductDefinitionUpdateInput {
  name?: string;
  description?: string;
  article_number?: string;
  is_customisable?: boolean;
  moq_sets?: number;
  moq_units?: number;
  ships_from?: string;
  shipping_days?: string;
  attributes?: Record<string, string[]>;
  tags?: string[];
  min_quantity_per_set?: number;
  max_quantity_per_set?: number;
  b2b_min_order_qty?: number;
  b2b_max_order_qty?: number;
  b2c_min_order_qty?: number;
  b2c_max_order_qty?: number;
  // category_slug / subcategory_slug / gender / inventory_type / set_purchase_mode
  // are immutable after publish and intentionally not exposed here — see
  // AddProductClient's edit-mode taxonomy fields (read-only once created).
}

export interface UpdateProductPayload {
  product?: ProductDefinitionUpdateInput;
  variants?: VariantConfigurationInput;
  pricing?: PricingInput;
  inventory?: InventoryInput;
  /** Generic/legacy image path — attaches without linking to a color. */
  images?: string[];
  /** The only path left for legacy (pre-taxonomy) products to edit sizes. */
  legacy_sizes?: string[];
}

export interface PresignImageResponse {
  upload_url: string;
  image_url: string;
  content_type: string;
  expires_in: number;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

/** One badge per row, matching the backend's status filter: an open admin decision
 * (pending or rejected) wins over the publish state. */
export function listingStatus(
  item: Pick<ProductListItem, "status" | "approval_status">,
): ProductRow["status"] {
  if (item.approval_status === "rejected") return "rejected";
  if (item.approval_status === "pending") return "pending_approval";
  return item.status === "published" ? "active" : "inactive";
}

export function toProductRow(item: ProductListItem): ProductRow {
  return {
    id: item.id,
    name: item.name,
    articleNumber: item.article_number,
    category: item.category,
    sizes: item.sizes,
    colors: item.colors,
    inventoryType: (item.inventory_type as ProductInventoryType) || "ready_to_ship",
    price: item.price,
    quantity: item.quantity,
    status: listingStatus(item),
    channels: item.channels,
    rejectionReason: item.approval_status === "rejected" ? (item.rejection_reason ?? null) : null,
    hasPendingChange: item.has_pending_change === true,
  };
}

export function parseProductDescription(raw: unknown): string {
  if (typeof raw !== "string" || !raw) return "";
  try {
    const parsed = JSON.parse(raw) as { blocks?: Array<{ data?: { text?: string } }> };
    return (parsed.blocks ?? []).map((b) => b.data?.text ?? "").join("\n");
  } catch {
    return raw;
  }
}

// ─── API calls ────────────────────────────────────────────────────────────────

export type ProductSortField = "NAME" | "DATE" | "PRICE";

export async function listProducts(params?: {
  status?: string;
  cursor?: string;
  limit?: number;
  /** Repeatable — the backend's channel values are disjoint, so several
   * selected channels come back as their union. Omit for "all channels". */
  channels?: ProductChannel[];
  search?: string;
  sort_by?: ProductSortField;
  sort_order?: "ASC" | "DESC";
  category_ids?: string[];
  inventory_types?: string[];
}): Promise<ProductListResponse> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.cursor) qs.set("cursor", params.cursor);
  if (params?.limit) qs.set("limit", String(params.limit));
  for (const channel of params?.channels ?? []) {
    qs.append("channel", channel);
  }
  if (params?.search) qs.set("search", params.search);
  if (params?.sort_by) qs.set("sort_by", params.sort_by);
  if (params?.sort_order) qs.set("sort_order", params.sort_order);
  if (params?.category_ids?.length) {
    for (const id of params.category_ids) {
      qs.append("category_id", id);
    }
  }
  if (params?.inventory_types?.length) {
    for (const t of params.inventory_types) {
      qs.append("inventory_type", t);
    }
  }
  const query = qs.toString() ? `?${qs.toString()}` : "";
  const res = await authService.api.get<ProductListResponse>(`/seller/products${query}`);
  return res.data;
}

export async function getProduct(productId: string): Promise<ProductDetail> {
  const res = await authService.api.get<ProductDetail>(`/seller/products/${productId}`);
  return res.data;
}

export async function createProduct(
  payload: CreateProductPayload,
): Promise<{ product_id: string; status: string; name: string; images_failed?: number }> {
  const res = await authService.api.post<{
    product_id: string;
    status: string;
    name: string;
    images_failed?: number;
  }>("/seller/products", payload);
  return res.data;
}

/** `pending_approval_skus` is set when the save added colors/sizes to a live product: they
 * are held until an admin approves them. */
export async function updateProduct(
  productId: string,
  payload: UpdateProductPayload,
): Promise<{
  product_id: string;
  updated: boolean;
  images_failed?: number;
  pending_approval_skus?: number;
}> {
  const res = await authService.api.patch<{
    product_id: string;
    updated: boolean;
    images_failed?: number;
    pending_approval_skus?: number;
  }>(`/seller/products/${productId}`, payload);
  return res.data;
}

export async function deleteProduct(
  productId: string,
): Promise<{ product_id: string; deleted: boolean }> {
  const res = await authService.api.delete<{ product_id: string; deleted: boolean }>(
    `/seller/products/${productId}`,
  );
  return res.data;
}

/** Publishes an approved product. For a product an admin hasn't approved yet this submits
 * it for approval instead: `status` comes back as "pending_approval" and it stays
 * unpublished. */
export async function publishProduct(
  productId: string,
): Promise<{ product_id: string; status: string; approval_status?: ProductApprovalStatus }> {
  const res = await authService.api.post<{
    product_id: string;
    status: string;
    approval_status?: ProductApprovalStatus;
  }>(`/seller/products/${productId}/publish`);
  return res.data;
}

export async function unpublishProduct(
  productId: string,
): Promise<{ product_id: string; status: string }> {
  const res = await authService.api.post<{ product_id: string; status: string }>(
    `/seller/products/${productId}/unpublish`,
  );
  return res.data;
}

export async function getCategories(): Promise<Category[]> {
  const res = await authService.api.get<{ categories: Category[] }>("/seller/products/categories");
  return res.data.categories;
}

export async function presignProductImage(
  filename: string,
  contentType: string,
): Promise<PresignImageResponse> {
  const res = await authService.api.post<PresignImageResponse>("/seller/products/presign-image", {
    filename,
    content_type: contentType,
  });
  return res.data;
}

export async function uploadImagesToStorage(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];
  return Promise.all(
    files.map(async (file) => {
      const { upload_url, image_url } = await presignProductImage(file.name, file.type);
      const res = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) {
        throw new Error(`Failed to upload ${file.name} (${res.status})`);
      }
      return image_url;
    })
  );
}

export async function updateProductVariant(
  productId: string,
  variantId: string,
  payload: { b2c_price?: number; b2b_price?: number; available_qty?: number },
): Promise<{ variant_id: string; updated: boolean }> {
  const res = await authService.api.patch<{ variant_id: string; updated: boolean }>(
    `/seller/products/${productId}/variants/${variantId}`,
    payload,
  );
  return res.data;
}

// ─── GET /seller/inventory/product/{product_id} ───────────────────────────
// Per-variant, per-warehouse stock breakdown for one product.

export interface ProductInventoryWarehouse {
  warehouse_id: string;
  saleor_warehouse_id: string;
  warehouse_name: string;
  status: "pending_approval" | "active" | "rejected";
  quantity: number;
}

export interface ProductInventoryVariant {
  variant_id: string;
  sku: string;
  variant_name: string;
  warehouses: ProductInventoryWarehouse[];
}

export interface ProductInventoryResponse {
  product_id: string;
  product_name: string;
  variants: ProductInventoryVariant[];
}

export async function getProductInventory(productId: string): Promise<ProductInventoryResponse> {
  const res = await authService.api.get<ProductInventoryResponse>(
    `/seller/inventory/product/${encodeURIComponent(productId)}`,
  );
  return res.data;
}

// ─── PATCH /seller/inventory/product/{product_id} ─────────────────────────
// Bulk-edit quantities for multiple variant/warehouse pairs at once.

export interface UpdateProductInventoryRow {
  variant_id: string;
  saleor_warehouse_id: string;
  new_quantity: number;
}

export interface UpdateProductInventoryResponse {
  applied: number;
  failed: number;
  errors: unknown[];
}

export async function updateProductInventory(
  productId: string,
  rows: UpdateProductInventoryRow[],
): Promise<UpdateProductInventoryResponse> {
  const res = await authService.api.patch<UpdateProductInventoryResponse>(
    `/seller/inventory/product/${encodeURIComponent(productId)}`,
    { rows },
  );
  return res.data;
}
