import { authService } from "@/lib/auth/authService";
import type { ProductInventoryType, ProductRow } from "@/lib/tableTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  thumbnail_url: string | null;
  sku: string | null;
  status: "published" | "draft";
  article_number: string;
  category: string;
  sizes: string;
  colors: string;
  inventory_type: string;
  price: string;
  quantity: number;
}

export interface ProductListResponse {
  products: ProductListItem[];
  has_next: boolean;
  cursor: string | null;
  total: number;
}

export interface ProductDetail {
  id: string;
  name: string;
  description: string;
  category: { id: string; name: string; slug: string } | null;
  thumbnail_url: string | null;
  images: Array<{ id: string; url: string; alt: string | null }>;
  variants: Array<{
    id: string;
    name?: string | null;
    sku?: string | null;
    price?: number | null;
    quantity?: number | null;
  }>;
  status: "published" | "draft";
  metadata: Record<string, string>;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  category_id: string;
  inventory_type: string;
  article_number?: string;
  gender?: string;
  shipping_days?: string;
  colors: string[];
  sizes: string[];
  tags: string[];
  mrp?: number;
  selling_price?: number;
  available_qty?: number;
  moq_sets?: number;
  moq_units?: number;
  min_quantity_per_set?: number;
  max_quantity_per_set?: number;
  images: string[];
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  category_id?: string;
  inventory_type?: string;
  article_number?: string;
  gender?: string;
  shipping_days?: string;
  colors?: string[];
  sizes?: string[];
  mrp?: number;
  selling_price?: number;
  available_qty?: number;
  tags?: string[];
  images?: string[];
}

export interface PresignImageResponse {
  upload_url: string;
  image_url: string;
  content_type: string;
  expires_in: number;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

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
    status: item.status === "published" ? "active" : "inactive",
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

export async function listProducts(params?: {
  status?: string;
  cursor?: string;
  limit?: number;
}): Promise<ProductListResponse> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.cursor) qs.set("cursor", params.cursor);
  if (params?.limit) qs.set("limit", String(params.limit));
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
): Promise<{ product_id: string; status: string; name: string }> {
  const res = await authService.api.post<{ product_id: string; status: string; name: string }>(
    "/seller/products",
    payload,
  );
  return res.data;
}

export async function updateProduct(
  productId: string,
  payload: UpdateProductPayload,
): Promise<{ product_id: string; updated: boolean }> {
  const res = await authService.api.patch<{ product_id: string; updated: boolean }>(
    `/seller/products/${productId}`,
    payload,
  );
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

export async function publishProduct(
  productId: string,
): Promise<{ product_id: string; status: string }> {
  const res = await authService.api.post<{ product_id: string; status: string }>(
    `/seller/products/${productId}/publish`,
  );
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
