/** Pure, framework-free helpers for the shared color x size variant matrix
 * used by both Create and Edit product flows (VariantMatrixEditor). Kept
 * side-effect-free and independently unit-testable — no React, no API
 * calls. Mirrors the backend's own independent-per-color model exactly
 * (ProductColor/ColorVariant): colors are never forced into a uniform
 * cross-product, and a color's images are its own, never shared. */
import type { ColorVariant, PriceOverrideInput } from "@/lib/api/products";

export type MatrixCell = { b2c_price: string; b2b_price: string };

export type PendingImage = { id: string; url: string; file: File };

export type ColorBlock = {
  color: string;
  /** This color's own sizes — independent of every other color's. */
  sizes: string[];
  /** Keyed by size. Always has one entry per entry in `sizes`. */
  cells: Record<string, MatrixCell>;
  /** Already on Saleor — display-only, never resubmitted (the backend's
   * per-color image assignment is append-only; resending an existing URL
   * would create a duplicate media row). */
  existingImages: { id: string; url: string }[];
  /** Uploaded this session, not yet saved — removable before submit. */
  newImages: PendingImage[];
};

export function emptyCell(): MatrixCell {
  return { b2c_price: "", b2b_price: "" };
}

export function emptyColorBlock(color: string): ColorBlock {
  return { color, sizes: [], cells: {}, existingImages: [], newImages: [] };
}

/** Builds the initial edit-mode matrix straight from get_product's
 * `variants.colors` — already exactly this shape server-side, so this is a
 * type/field mapping only, no restructuring. */
export function colorBlocksFromColorVariants(colors: ColorVariant[]): ColorBlock[] {
  return colors.map((cv) => {
    const cells: Record<string, MatrixCell> = {};
    const sizes: string[] = [];
    for (const s of cv.sizes) {
      sizes.push(s.size);
      cells[s.size] = {
        b2c_price: s.b2c_price != null ? String(s.b2c_price) : "",
        b2b_price: s.b2b_price != null ? String(s.b2b_price) : "",
      };
    }
    return {
      color: cv.color,
      sizes,
      cells,
      existingImages: cv.images.map((img) => ({ id: img.id, url: img.url })),
      newImages: [],
    };
  });
}

/** VariantConfiguration.colors payload — `images` is ONLY this color's
 * newly-uploaded URLs this session (real server URLs, from
 * `uploadedUrlsByColor`, never a `newImages[].url` blob: URL directly —
 * the caller must upload each color's pending files first), and never
 * `existingImages`; resending an already-saved URL would duplicate it
 * server-side (see ColorBlock.existingImages).
 *
 * A color with zero sizes is NOT dropped — the backend's compute_size_set
 * treats an empty size list as a legitimate single sizeless ("Default")
 * variant (e.g. accessories), matching the pre-existing create-flow
 * behavior. A seller who wants to discard a color entirely should remove
 * it explicitly rather than relying on "empty sizes" as an implicit signal. */
export function buildVariantConfigurationColors(
  blocks: ColorBlock[],
  uploadedUrlsByColor: Record<string, string[]> = {},
): { color: string; images: string[]; sizes: string[] }[] {
  return blocks.map((b) => ({
    color: b.color,
    images: uploadedUrlsByColor[b.color] ?? [],
    sizes: [...b.sizes],
  }));
}

/** Every (color, size) cell becomes one price override — the same shape Create
 * already sends, reused for Edit. A blank price is omitted (`undefined`) so the
 * backend leaves that channel's price alone rather than zeroing it.
 *
 * Stock is deliberately absent. Quantity is set per warehouse on the product's
 * own page after publishing, so this form has no quantity to send — and sending
 * a 0 would be worse than sending nothing: the backend writes stock overrides
 * through _broadcast_stock_rows, which would zero a single-warehouse variant's
 * real stock on every save. */
export function buildOverridesFromColorBlocks(blocks: ColorBlock[]): {
  priceOverrides: PriceOverrideInput[];
} {
  const priceOverrides: PriceOverrideInput[] = [];
  for (const b of blocks) {
    for (const size of b.sizes) {
      const cell = b.cells[size] ?? emptyCell();
      priceOverrides.push({
        color: b.color,
        size,
        b2c_price: cell.b2c_price ? parseFloat(cell.b2c_price) : undefined,
        b2b_price: cell.b2b_price ? parseFloat(cell.b2b_price) : undefined,
      });
    }
  }
  return { priceOverrides };
}

export function cellKey(color: string, size: string): string {
  return `${color}::${size}`;
}

/** Copy/paste — copies only the editable fields (prices), never
 * color/size/SKU/variant identity, onto every targeted cell. Pure so the
 * paste logic is unit-testable without mounting the editor. */
export function pasteCellIntoTargets(
  blocks: ColorBlock[],
  clipboard: MatrixCell,
  targets: ReadonlySet<string>,
): ColorBlock[] {
  if (targets.size === 0) return blocks;
  return blocks.map((b) => {
    let changed = false;
    const nextCells = { ...b.cells };
    for (const size of b.sizes) {
      if (!targets.has(cellKey(b.color, size))) continue;
      nextCells[size] = { ...clipboard };
      changed = true;
    }
    return changed ? { ...b, cells: nextCells } : b;
  });
}

export function hasColor(blocks: ColorBlock[], color: string): boolean {
  return blocks.some((b) => b.color === color);
}
