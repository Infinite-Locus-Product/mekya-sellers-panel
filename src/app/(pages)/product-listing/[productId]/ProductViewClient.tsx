"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Package, Tag, Ruler, Palette, Info, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COLOR_PALETTE } from "@/components/shared/ColorSelect";
import { PRODUCT_INVENTORY_TYPE_LABELS } from "@/lib/tableTypes";
import { getProduct, parseProductDescription } from "@/lib/api/products";
import type { ProductDetail } from "@/lib/api/products";

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

// ─── Main component ───────────────────────────────────────────────────────────

export function ProductViewClient({ productId }: { productId: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState(false);

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
  const colors = (meta.colors ?? "").split(",").filter(Boolean);
  const sizes = (meta.sizes ?? "").split(",").filter(Boolean);
  const tags = (meta.tags ?? "").split(",").filter(Boolean);
  const description = parseProductDescription(product.description);

  const mrp = meta.mrp ? parseFloat(meta.mrp) : null;
  const channels = meta.channels as "b2c" | "b2b" | "both" | undefined;

  const b2cVariant = product.variants[0];
  const b2cPrice = b2cVariant?.b2c_price;
  const b2bPrice = b2cVariant?.b2b_price;

  const inventoryLabel =
    PRODUCT_INVENTORY_TYPE_LABELS[meta.inventory_type as keyof typeof PRODUCT_INVENTORY_TYPE_LABELS]
    ?? meta.inventory_type;

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
                      {t.trim()}
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
              <DetailRow label="Article Number" value={meta.article_number || "—"} />
              <DetailRow label="Category" value={product.category?.name} />
              <DetailRow label="Inventory Type" value={inventoryLabel} />
              <DetailRow label="Gender" value={meta.gender} />
              <DetailRow label="Shipping Days" value={meta.shipping_days} />
              {meta.min_quantity_per_set && (
                <DetailRow label="Min Qty / Set" value={meta.min_quantity_per_set} />
              )}
              {meta.max_quantity_per_set && (
                <DetailRow label="Max Qty / Set" value={meta.max_quantity_per_set} />
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
                    <span className="text-base font-semibold text-blue-700">
                      {b2cPrice != null ? `₹${b2cPrice.toLocaleString("en-IN")}` : "—"}
                    </span>
                  </div>
                )}
                {channels !== "b2c" && (
                  <div className="flex flex-col items-center gap-0.5 p-3 text-center">
                    <span className="text-[10px] text-purple-600 uppercase tracking-wide">B2B Price</span>
                    <span className="text-base font-semibold text-purple-700">
                      {b2bPrice != null ? `₹${b2bPrice.toLocaleString("en-IN")}` : "—"}
                    </span>
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
                          {c.trim()}
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
                      {s.trim()}
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

      {/* Variants table */}
      {product.variants.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4">
            <SectionTitle icon={Layers} title={`Variants (${product.variants.length})`} />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Variant</th>
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
                  {product.variants.map((v, idx) => (
                    <tr
                      key={v.id}
                      className={`border-b last:border-0 ${idx % 2 === 1 ? "bg-muted/20" : ""}`}
                    >
                      <td className="px-3 py-2 font-medium">{v.name ?? "Default"}</td>
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
    </div>
  );
}
