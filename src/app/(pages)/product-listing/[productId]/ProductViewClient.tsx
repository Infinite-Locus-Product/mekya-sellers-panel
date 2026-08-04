"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Package, Tag, Ruler, Palette, Info, Layers, Boxes, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";
import { COLOR_PALETTE } from "@/components/shared/ColorSelect";
import { PRODUCT_INVENTORY_TYPE_LABELS } from "@/lib/tableTypes";
import {
  getProduct,
  getProductInventory,
  updateProductInventory,
  parseProductDescription,
} from "@/lib/api/products";
import type {
  ProductDetail,
  FlatVariant,
  ProductInventoryVariant,
} from "@/lib/api/products";

interface WarehouseColumn {
  saleor_warehouse_id: string;
  warehouse_name: string;
}

// ─── Colour lookup ────────────────────────────────────────────────────────────

const COLOR_HEX: Record<string, string> = Object.fromEntries(
  COLOR_PALETTE.map((c) => [c.value.toLowerCase(), c.hex])
);

function colorHex(name: string): string | undefined {
  return COLOR_HEX[name.trim().toLowerCase()];
}

// ─── Small presentational helpers ────────────────────────────────────────────

function StatusBadge({ status }: { status: "published" | "draft" }) {
  return status === "published" ? (
    <span className="rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-medium text-[#166534]">
      Active
    </span>
  ) : (
    <span className="rounded-full bg-[#E5E7EB] px-3 py-1 text-xs font-medium text-[#374151]">
      Draft
    </span>
  );
}

function ChannelBadge({ channels }: { channels?: string }) {
  const ch = (channels ?? "both") as "b2c" | "b2b" | "both";
  const cfg = {
    b2c:  { label: "B2C only",   cls: "bg-blue-100 text-blue-700" },
    b2b:  { label: "B2B only",   cls: "bg-purple-100 text-purple-700" },
    both: { label: "B2C & B2B",  cls: "bg-green-100 text-green-700" },
  } as const;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${cfg[ch].cls}`}>
      {cfg[ch].label}
    </span>
  );
}

function LegacyBadge() {
  return (
    <span
      className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
      title="Created before the taxonomy system — category, attributes, and variants can't be edited here."
    >
      Legacy product
    </span>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b pb-2 mb-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-sm font-semibold text-foreground">{title}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <Skeleton className="h-5 w-48" />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square rounded" />)}
          </div>
        </div>
        <div className="space-y-4 lg:col-span-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Pricing helpers ──────────────────────────────────────────────────────────

/** get_product has no single aggregated price field (unlike list_products) —
 * derive a min/max range across variant_list, same "aggregate across every
 * variant" principle the backend applies for the listing price. */
function priceRange(variants: FlatVariant[], key: "b2c_price" | "b2b_price"): string {
  const amounts = variants.map((v) => v[key]).filter((a): a is number => a != null);
  if (amounts.length === 0) return "—";
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  if (min === max) return `₹${min.toLocaleString("en-IN")}`;
  return `₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString("en-IN")}`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProductViewClient({ productId }: { productId: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState(false);

  const [inventoryVariants, setInventoryVariants] = useState<ProductInventoryVariant[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [inventoryEdits, setInventoryEdits] = useState<Record<string, string>>({});
  const [isSavingInventory, setIsSavingInventory] = useState(false);

  useEffect(() => {
    getProduct(productId)
      .then((p) => {
        setProduct(p);
        setIsLoading(false);
      })
      .catch(() => {
        setError(true);
        setIsLoading(false);
      });
  }, [productId]);

  useEffect(() => {
    let cancelled = false;
    setLoadingInventory(true);
    getProductInventory(productId)
      .then((result) => {
        if (cancelled) return;
        setInventoryVariants(result.variants);
        setInventoryEdits({});
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load inventory by warehouse");
      })
      .finally(() => {
        if (!cancelled) setLoadingInventory(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  // One column per distinct warehouse seen across any variant, in first-seen order.
  const warehouseColumns: WarehouseColumn[] = useMemo(() => {
    const seen = new Map<string, string>();
    for (const variant of inventoryVariants) {
      for (const w of variant.warehouses) {
        if (!seen.has(w.saleor_warehouse_id)) seen.set(w.saleor_warehouse_id, w.warehouse_name);
      }
    }
    return Array.from(seen, ([saleor_warehouse_id, warehouse_name]) => ({
      saleor_warehouse_id,
      warehouse_name,
    }));
  }, [inventoryVariants]);

  const editKey = (variantId: string, saleorWarehouseId: string) => `${variantId}::${saleorWarehouseId}`;

  const dirtyInventoryRows = useMemo(() => {
    const dirty: Array<{ variant_id: string; saleor_warehouse_id: string; new_quantity: number }> = [];
    for (const variant of inventoryVariants) {
      for (const w of variant.warehouses) {
        const edited = inventoryEdits[editKey(variant.variant_id, w.saleor_warehouse_id)];
        if (edited !== undefined && edited.trim() !== "" && Number(edited) !== w.quantity) {
          dirty.push({
            variant_id: variant.variant_id,
            saleor_warehouse_id: w.saleor_warehouse_id,
            new_quantity: Number(edited),
          });
        }
      }
    }
    return dirty;
  }, [inventoryVariants, inventoryEdits]);

  const invalidInventoryEdit = Object.entries(inventoryEdits).some(([, value]) => {
    if (value.trim() === "") return false;
    const num = Number(value);
    return !Number.isFinite(num) || num < 0 || !Number.isInteger(num);
  });

  const saveInventory = async () => {
    if (invalidInventoryEdit) {
      toast.error("Quantities must be whole numbers of 0 or more");
      return;
    }
    if (dirtyInventoryRows.length === 0) {
      toast.error("No quantity changes to save");
      return;
    }
    setIsSavingInventory(true);
    try {
      const res = await updateProductInventory(productId, dirtyInventoryRows);
      if (res.failed > 0) {
        toast.error(`${res.applied} updated, ${res.failed} failed`, {
          description: res.errors.length > 0 ? JSON.stringify(res.errors[0]) : undefined,
        });
      } else {
        toast.success(`Updated ${res.applied} cell${res.applied === 1 ? "" : "s"}`);
      }
      setInventoryVariants((prev) =>
        prev.map((variant) => ({
          ...variant,
          warehouses: variant.warehouses.map((w) => {
            const match = dirtyInventoryRows.find(
              (r) => r.variant_id === variant.variant_id && r.saleor_warehouse_id === w.saleor_warehouse_id,
            );
            return match ? { ...w, quantity: match.new_quantity } : w;
          }),
        })),
      );
      setInventoryEdits({});
    } catch (err) {
      toast.error("Could not update inventory", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsSavingInventory(false);
    }
  };

  const inventoryColumns: TableColumn<ProductInventoryVariant>[] = useMemo(
    () => [
      {
        key: "variant_name",
        header: "Variant",
        cell: (variant) => (
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-foreground min-[1920px]:text-sm">
              {variant.variant_name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{variant.sku}</p>
          </div>
        ),
      },
      ...warehouseColumns.map((wh): TableColumn<ProductInventoryVariant> => ({
        key: wh.saleor_warehouse_id,
        header: wh.warehouse_name,
        align: "center",
        cell: (variant) => {
          const entry = variant.warehouses.find((w) => w.saleor_warehouse_id === wh.saleor_warehouse_id);
          if (!entry) {
            return <span className="text-[11px] text-muted-foreground">—</span>;
          }
          const key = editKey(variant.variant_id, wh.saleor_warehouse_id);
          const value = inventoryEdits[key] ?? String(entry.quantity);
          const isDirty = dirtyInventoryRows.some(
            (r) => r.variant_id === variant.variant_id && r.saleor_warehouse_id === wh.saleor_warehouse_id,
          );
          return (
            <Input
              type="number"
              min={0}
              step={1}
              value={value}
              onChange={(e) => setInventoryEdits((prev) => ({ ...prev, [key]: e.target.value }))}
              className={`mx-auto h-8 w-20 text-center text-sm ${isDirty ? "border-amber-500 focus-visible:ring-amber-500" : ""}`}
            />
          );
        },
      })),
    ],
    [warehouseColumns, inventoryEdits, dirtyInventoryRows],
  );

  if (isLoading) return <LoadingSkeleton />;

  if (error || !product) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <Package className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">Product not found</p>
        <Button variant="outline" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  const meta = product.metadata;
  const def = product.product;

  // Colors/sizes/tags/gender: legacy products only ever have the best-effort
  // comma-joined metadata reading; non-legacy products carry this data in the
  // real taxonomy/variant-matrix response sections instead. Never mix the two.
  const colors = product.is_legacy
    ? (product.legacy?.colors ?? [])
    : (product.variants?.colors.map((c) => c.color) ?? []);
  const sizes = product.is_legacy
    ? (product.legacy?.sizes ?? [])
    : Array.from(
        new Set(product.variants?.colors.flatMap((c) => c.sizes.map((s) => s.size)) ?? [])
      );
  const tags = product.is_legacy ? (product.legacy?.tags ?? []) : (product.taxonomy?.tags ?? []);
  const gender = product.is_legacy ? product.legacy?.gender : product.taxonomy?.gender;

  const description = parseProductDescription(product.description);

  const mrp = meta.mrp ? parseFloat(meta.mrp) : null;
  const channels = meta.channels as "b2c" | "b2b" | "both" | undefined;

  const b2cPriceDisplay = priceRange(product.variant_list, "b2c_price");
  const b2bPriceDisplay = priceRange(product.variant_list, "b2b_price");

  const inventoryLabel =
    PRODUCT_INVENTORY_TYPE_LABELS[def.inventory_type as keyof typeof PRODUCT_INVENTORY_TYPE_LABELS]
    ?? def.inventory_type;

  const allImages = product.images.length > 0
    ? product.images
    : product.thumbnail_url
      ? [{ id: "thumb", url: product.thumbnail_url, alt: product.name }]
      : [];

  const editHref = `/product-listing/add-product?productId=${encodeURIComponent(productId)}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/dashboard" className="hover:underline">Seller Dashboard</Link>
        {" > "}
        <Link href="/product-listing" className="hover:underline">Product Listing</Link>
        {" > "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Page header */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="flex-1 text-xl font-semibold text-foreground">{product.name}</h1>
        <StatusBadge status={product.status} />
        <ChannelBadge channels={channels} />
        {product.is_legacy && <LegacyBadge />}
        <Link
          href={editHref}
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Product
        </Link>
      </div>

      {/* Main two-column grid */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* ── Left: Image gallery ────────────────────────────── */}
        <div className="space-y-3 lg:col-span-2">
          {allImages.length > 0 ? (
            <>
              {/* Main image */}
              <div className="relative overflow-hidden rounded-xl border bg-muted aspect-square">
                <img
                  src={allImages[selectedImage]?.url}
                  alt={allImages[selectedImage]?.alt ?? product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      className={`overflow-hidden rounded-lg border-2 aspect-square transition-colors ${
                        idx === selectedImage
                          ? "border-foreground"
                          : "border-transparent hover:border-muted-foreground/40"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.alt ?? `Image ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-xl border bg-muted text-muted-foreground">
              <Package className="h-16 w-16 opacity-30" />
            </div>
          )}

          {/* Tags card */}
          {tags.length > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-4">
                <SectionTitle icon={Tag} title="Tags" />
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right: Product info ────────────────────────────── */}
        <div className="space-y-4 lg:col-span-3">

          {/* Basic details */}
          <Card>
            <CardHeader className="pb-2 pt-4">
              <SectionTitle icon={Info} title="Product Details" />
            </CardHeader>
            <CardContent className="space-y-2 pb-4">
              <DetailRow label="Article Number" value={def.article_number || "—"} />
              <DetailRow label="Category" value={product.category?.name} />
              <DetailRow label="Inventory Type" value={inventoryLabel} />
              <DetailRow label="Gender" value={gender} />
              <DetailRow label="Shipping Days" value={def.shipping_days} />
              <DetailRow label="Ships From" value={def.ships_from} />
              <DetailRow label="Customisable" value={def.is_customisable ? "Yes" : "No"} />
              <DetailRow label="Set Purchase Mode" value={def.set_purchase_mode} />
              {def.moq_sets != null && (
                <DetailRow label="MOQ (Sets)" value={String(def.moq_sets)} />
              )}
              {def.moq_units != null && (
                <DetailRow label="MOQ (Units)" value={String(def.moq_units)} />
              )}
              {def.min_quantity_per_set != null && (
                <DetailRow label="Min Qty / Set" value={String(def.min_quantity_per_set)} />
              )}
              {def.max_quantity_per_set != null && (
                <DetailRow label="Max Qty / Set" value={String(def.max_quantity_per_set)} />
              )}
              {(def.b2b_min_order_qty != null || def.b2b_max_order_qty != null) && (
                <DetailRow
                  label="B2B Order Qty"
                  value={`${def.b2b_min_order_qty ?? "—"} – ${def.b2b_max_order_qty ?? "—"}`}
                />
              )}
              {(def.b2c_min_order_qty != null || def.b2c_max_order_qty != null) && (
                <DetailRow
                  label="B2C Order Qty"
                  value={`${def.b2c_min_order_qty ?? "—"} – ${def.b2c_max_order_qty ?? "—"}`}
                />
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader className="pb-2 pt-4">
              <SectionTitle icon={Info} title="Pricing" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-3 divide-x rounded-lg border">
                <div className="flex flex-col items-center gap-0.5 p-3 text-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">MRP</span>
                  <span className="text-base font-semibold">
                    {mrp != null ? `₹${mrp.toLocaleString("en-IN")}` : "—"}
                  </span>
                </div>
                {channels !== "b2b" && (
                  <div className="flex flex-col items-center gap-0.5 p-3 text-center">
                    <span className="text-[10px] text-blue-600 uppercase tracking-wide">B2C Price</span>
                    <span className="text-base font-semibold text-blue-700">{b2cPriceDisplay}</span>
                  </div>
                )}
                {channels !== "b2c" && (
                  <div className="flex flex-col items-center gap-0.5 p-3 text-center">
                    <span className="text-[10px] text-purple-600 uppercase tracking-wide">B2B Price</span>
                    <span className="text-base font-semibold text-purple-700">{b2bPriceDisplay}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          {colors.length > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-4">
                <SectionTitle icon={Palette} title={`Colors (${colors.length})`} />
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => {
                    const hex = colorHex(c);
                    return (
                      <div key={c} className="flex items-center gap-1.5">
                        {hex ? (
                          <span
                            className="h-5 w-5 shrink-0 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: hex }}
                          />
                        ) : null}
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                          {c}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-4">
                <SectionTitle icon={Ruler} title={`Sizes (${sizes.length})`} />
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border bg-background px-3 py-1 text-xs font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Description */}
      {description && (
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-semibold">Description</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Variants table — flat per-(color,size) list, mirrors get_product_variants */}
      {product.variant_list.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4">
            <SectionTitle icon={Layers} title={`Variants (${product.variant_list.length})`} />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Color</th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Size</th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">SKU</th>
                    {channels !== "b2b" && (
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-blue-600">B2C Price</th>
                    )}
                    {channels !== "b2c" && (
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-purple-600">B2B Price</th>
                    )}
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variant_list.map((v, idx) => (
                    <tr
                      key={v.id}
                      className={`border-b last:border-0 ${idx % 2 === 1 ? "bg-muted/20" : ""}`}
                    >
                      <td className="px-3 py-2 font-medium">{v.color ?? "—"}</td>
                      <td className="px-3 py-2 font-medium">{v.size ?? "Default"}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{v.sku ?? "—"}</td>
                      {channels !== "b2b" && (
                        <td className="px-3 py-2 text-right font-medium text-blue-700">
                          {v.b2c_price != null ? `₹${v.b2c_price.toLocaleString("en-IN")}` : "—"}
                        </td>
                      )}
                      {channels !== "b2c" && (
                        <td className="px-3 py-2 text-right font-medium text-purple-700">
                          {v.b2b_price != null ? `₹${v.b2b_price.toLocaleString("en-IN")}` : "—"}
                        </td>
                      )}
                      <td className="px-3 py-2 text-right tabular-nums">
                        {v.quantity ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory by warehouse */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2 pt-4">
          <SectionTitle icon={Boxes} title="Inventory by Warehouse" />
          <div className="flex items-center gap-2">
            <p className="text-[11px] text-muted-foreground">
              {dirtyInventoryRows.length > 0
                ? `${dirtyInventoryRows.length} unsaved change${dirtyInventoryRows.length === 1 ? "" : "s"}`
                : ""}
            </p>
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs"
              disabled={isSavingInventory || loadingInventory || dirtyInventoryRows.length === 0}
              onClick={saveInventory}
            >
              {isSavingInventory ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {loadingInventory ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable
              columns={inventoryColumns}
              data={inventoryVariants}
              striped
              emptyMessage="No warehouse stock found for this product."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
