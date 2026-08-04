import { authService } from "@/lib/auth/authService";

// ─── Shared warehouse shapes ──────────────────────────────────────────────

export type WarehouseFulfillmentModel = "self_fulfilled" | "marketplace_fulfilled";
export type WarehouseStatus = "pending_approval" | "active" | "rejected";

/** Address as sent on POST /seller/warehouses — snake_case, distinct from the response shape. */
export interface RegisterWarehouseAddressInput {
  street_address_1: string;
  street_address_2?: string | null;
  city: string;
  postal_code: string;
  country_area: string;
  country_code: string;
}

/** Address as returned on the warehouse object — camelCase, nested country code. */
export interface ApiWarehouseAddress {
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  postalCode: string;
  countryArea: string;
  country: { code: string };
}

export interface ApiWarehouse {
  id: string;
  saleor_warehouse_id: string;
  name: string;
  // Observed null immediately after registration — Saleor address sync can lag the warehouse record.
  address: ApiWarehouseAddress | null;
  fulfillment_model: WarehouseFulfillmentModel;
  status: WarehouseStatus;
  /** Number of dry-run orders required before this warehouse can go active. */
  dry_run_orders_required: number;
  dry_run_completed_at: string | null;
  rejection_reason: string | null;
  rejected_at: string | null;
  created_at: string;
}

// ─── POST /seller/warehouses ──────────────────────────────────────────────
// New warehouses start at "pending_approval" until an admin approves them.

export interface RegisterWarehouseRequest {
  name: string;
  address: RegisterWarehouseAddressInput;
  fulfillment_model: WarehouseFulfillmentModel;
  gstin_apob_ref?: string | null;
  /** Warehouse contact person's phone number. */
  contact_number: string;
}

export async function registerWarehouse(body: RegisterWarehouseRequest): Promise<ApiWarehouse> {
  const res = await authService.api.post<ApiWarehouse>("/seller/warehouses", body);
  return res.data;
}

// ─── GET /seller/warehouses ───────────────────────────────────────────────

export async function listWarehouses(): Promise<ApiWarehouse[]> {
  const res = await authService.api.get<{ warehouses: ApiWarehouse[] }>("/seller/warehouses");
  return res.data.warehouses ?? [];
}

// ─── GET /seller/warehouses/{warehouse_id} ────────────────────────────────

export async function getWarehouse(warehouseId: string): Promise<ApiWarehouse> {
  const res = await authService.api.get<ApiWarehouse>(
    `/seller/warehouses/${encodeURIComponent(warehouseId)}`,
  );
  return res.data;
}

// ─── GET/PUT /seller/warehouses/{warehouse_id}/serviceable-zones ─────────
// PUT is a full replace — send an empty array to clear all zones.

export interface ServiceableZone {
  id: string;
  pincode_start: string;
  pincode_end: string;
  sla_days: number;
  source: string;
}

export interface ServiceableZoneInput {
  pincode_start: string;
  pincode_end: string;
  /** 1–30, default 5. */
  sla_days: number;
}

export async function getServiceableZones(warehouseId: string): Promise<ServiceableZone[]> {
  const res = await authService.api.get<{ zones: ServiceableZone[] }>(
    `/seller/warehouses/${encodeURIComponent(warehouseId)}/serviceable-zones`,
  );
  return res.data.zones ?? [];
}

export async function putServiceableZones(
  warehouseId: string,
  zones: ServiceableZoneInput[],
): Promise<ServiceableZone[]> {
  const res = await authService.api.put<{ zones: ServiceableZone[] }>(
    `/seller/warehouses/${encodeURIComponent(warehouseId)}/serviceable-zones`,
    { zones },
  );
  return res.data.zones ?? [];
}

// ─── GET /seller/warehouses/{warehouse_id}/inventory ─────────────────────
// All seller SKUs with quantities at this warehouse.

export interface WarehouseInventoryItem {
  variant_id: string;
  sku: string;
  variant_name: string;
  product_name: string;
  /** Quantity at this warehouse. */
  quantity: number;
  /** Quantity across all of the seller's warehouses. */
  total_quantity: number;
}

export type WarehouseInventoryStockStatus = "all" | "in_stock" | "out_of_stock";
export type WarehouseInventorySortBy = "sku" | "product_name" | "quantity" | "total_quantity";
export type WarehouseInventorySortOrder = "asc" | "desc";

export interface GetWarehouseInventoryParams {
  stock_status?: WarehouseInventoryStockStatus;
  sort_by?: WarehouseInventorySortBy;
  sort_order?: WarehouseInventorySortOrder;
  /** Case-insensitive match against product name and SKU. */
  search?: string;
}

/** Always computed on the full unfiltered set — unaffected by `stock_status`. */
export interface WarehouseInventorySummary {
  total_skus: number;
  in_stock: number;
  out_of_stock: number;
}

export interface GetWarehouseInventoryResponse {
  summary: WarehouseInventorySummary;
  inventory: WarehouseInventoryItem[];
}

export async function getWarehouseInventory(
  warehouseId: string,
  params?: GetWarehouseInventoryParams,
): Promise<GetWarehouseInventoryResponse> {
  const query = new URLSearchParams();
  if (params?.stock_status) query.set("stock_status", params.stock_status);
  if (params?.sort_by) query.set("sort_by", params.sort_by);
  if (params?.sort_order) query.set("sort_order", params.sort_order);
  if (params?.search) query.set("search", params.search);
  const qs = query.toString();
  const res = await authService.api.get<GetWarehouseInventoryResponse>(
    `/seller/warehouses/${encodeURIComponent(warehouseId)}/inventory${qs ? `?${qs}` : ""}`,
  );
  return res.data;
}

// ─── PATCH /seller/warehouses/{warehouse_id}/inventory ───────────────────
// Bulk-edit multiple SKU quantities at once (also works for a single SKU).

export interface UpdateWarehouseInventoryRow {
  /** Accepts SKU strings, Saleor global IDs, or plain numeric IDs. */
  sku_id: string;
  new_quantity: number;
}

export interface UpdateWarehouseInventoryResponse {
  applied: number;
  failed: number;
  errors: unknown[];
}

export async function updateWarehouseInventory(
  warehouseId: string,
  rows: UpdateWarehouseInventoryRow[],
): Promise<UpdateWarehouseInventoryResponse> {
  const res = await authService.api.patch<UpdateWarehouseInventoryResponse>(
    `/seller/warehouses/${encodeURIComponent(warehouseId)}/inventory`,
    { rows },
  );
  return res.data;
}

