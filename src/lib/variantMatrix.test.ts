import { describe, it, expect } from "vitest";
import {
  colorBlocksFromColorVariants,
  buildVariantConfigurationColors,
  buildOverridesFromColorBlocks,
  pasteCellIntoTargets,
  cellKey,
  hasColor,
  emptyColorBlock,
  type ColorBlock,
} from "./variantMatrix";
import type { ColorVariant } from "@/lib/api/products";

function colorVariant(overrides: Partial<ColorVariant> = {}): ColorVariant {
  return {
    color: "Red",
    images: [],
    sizes: [{ size: "S", variant_id: "v1", sku: "sku-1", b2c_price: 500, b2b_price: 400, available_qty: 10 }],
    ...overrides,
  };
}

describe("colorBlocksFromColorVariants", () => {
  it("maps get_product's colors shape into independent per-color blocks", () => {
    const blocks = colorBlocksFromColorVariants([
      colorVariant({
        color: "Red",
        images: [{ id: "img-1", url: "https://x/red.jpg", alt: null }],
        sizes: [
          { size: "S", variant_id: "v1", sku: "sku-1", b2c_price: 500, b2b_price: 400, available_qty: 10 },
          { size: "M", variant_id: "v2", sku: "sku-2", b2c_price: 550, b2b_price: null, available_qty: 5 },
        ],
      }),
      colorVariant({ color: "Black", images: [], sizes: [{ size: "S", variant_id: "v3", sku: "sku-3", b2c_price: null, b2b_price: null, available_qty: 0 }] }),
    ]);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].color).toBe("Red");
    expect(blocks[0].sizes).toEqual(["S", "M"]);
    expect(blocks[0].cells.S).toEqual({ b2c_price: "500", b2b_price: "400" });
    expect(blocks[0].cells.M).toEqual({ b2c_price: "550", b2b_price: "" });
    expect(blocks[0].existingImages).toEqual([{ id: "img-1", url: "https://x/red.jpg" }]);
    expect(blocks[0].newImages).toEqual([]);
    // Independent sizes: Black only has S, Red has S and M — never forced to match.
    expect(blocks[1].sizes).toEqual(["S"]);
  });

  it("renders null prices as blank strings, not '0' or 'null'", () => {
    const blocks = colorBlocksFromColorVariants([
      colorVariant({ sizes: [{ size: "S", variant_id: "v1", sku: "s", b2c_price: null, b2b_price: null, available_qty: null }] }),
    ]);
    expect(blocks[0].cells.S).toEqual({ b2c_price: "", b2b_price: "" });
  });
});

describe("buildVariantConfigurationColors", () => {
  it("sends only the uploaded URLs passed in for that color, never existingImages (append-only backend constraint)", () => {
    const blocks: ColorBlock[] = [
      {
        color: "Red",
        sizes: ["S"],
        cells: { S: { b2c_price: "500", b2b_price: "400" } },
        existingImages: [{ id: "img-1", url: "https://x/already-saved.jpg" }],
        newImages: [{ id: "new-1", url: "blob:local-preview", file: new File([], "new.jpg") }],
      },
    ];

    const [payload] = buildVariantConfigurationColors(blocks, { Red: ["https://x/new.jpg"] });

    expect(payload.images).toEqual(["https://x/new.jpg"]);
    expect(payload.images).not.toContain("https://x/already-saved.jpg");
    expect(payload.images).not.toContain("blob:local-preview");
  });

  it("sends an empty images array when no uploaded URLs are given for that color", () => {
    const blocks: ColorBlock[] = [
      {
        color: "Red",
        sizes: ["S"],
        cells: { S: { b2c_price: "500", b2b_price: "400" } },
        existingImages: [{ id: "img-1", url: "https://x/already-saved.jpg" }],
        newImages: [],
      },
    ];

    const [payload] = buildVariantConfigurationColors(blocks);

    expect(payload.images).toEqual([]);
  });

  it("keeps a color with zero sizes — it's a legitimate sizeless ('Default') variant, not an incomplete entry", () => {
    const blocks: ColorBlock[] = [emptyColorBlock("Red"), { ...emptyColorBlock("Black"), sizes: ["M"], cells: { M: { b2c_price: "", b2b_price: "" } } }];

    const payload = buildVariantConfigurationColors(blocks);

    expect(payload.map((p) => p.color)).toEqual(["Red", "Black"]);
    expect(payload[0].sizes).toEqual([]);
  });
});

describe("buildOverridesFromColorBlocks", () => {
  it("produces one price override per (color, size) cell and no stock at all", () => {
    const blocks: ColorBlock[] = [
      {
        color: "Red",
        sizes: ["S", "M"],
        cells: {
          S: { b2c_price: "500", b2b_price: "400" },
          M: { b2c_price: "", b2b_price: "" },
        },
        existingImages: [],
        newImages: [],
      },
    ];

    const result = buildOverridesFromColorBlocks(blocks);

    expect(result.priceOverrides).toEqual([
      { color: "Red", size: "S", b2c_price: 500, b2b_price: 400 },
      { color: "Red", size: "M", b2c_price: undefined, b2b_price: undefined },
    ]);
    // Quantity is set per warehouse on the product page, so this form sends no stock.
    // Sending 0 would be worse than sending nothing: the backend's stock override path
    // would zero a single-warehouse variant's real stock on every save.
    expect("stockOverrides" in result).toBe(false);
  });
});

describe("pasteCellIntoTargets", () => {
  it("copies only price fields onto every targeted cell, never color/size identity", () => {
    const blocks: ColorBlock[] = [
      {
        color: "Red",
        sizes: ["S", "M", "L"],
        cells: {
          S: { b2c_price: "999", b2b_price: "888" },
          M: { b2c_price: "1", b2b_price: "1" },
          L: { b2c_price: "1", b2b_price: "1" },
        },
        existingImages: [],
        newImages: [],
      },
    ];
    const clipboard = { b2c_price: "999", b2b_price: "888" };
    const targets = new Set([cellKey("Red", "M"), cellKey("Red", "L")]);

    const result = pasteCellIntoTargets(blocks, clipboard, targets);

    expect(result[0].cells.S).toEqual({ b2c_price: "999", b2b_price: "888" }); // untouched (not a target)
    expect(result[0].cells.M).toEqual(clipboard);
    expect(result[0].cells.L).toEqual(clipboard);
    expect(result[0].color).toBe("Red"); // identity fields never touched
    expect(result[0].sizes).toEqual(["S", "M", "L"]);
  });

  it("is a no-op when there are no targets", () => {
    const blocks: ColorBlock[] = [emptyColorBlock("Red")];
    const result = pasteCellIntoTargets(blocks, { b2c_price: "1", b2b_price: "1" }, new Set());
    expect(result).toBe(blocks);
  });
});

describe("hasColor", () => {
  it("detects an existing color case-sensitively exact match", () => {
    const blocks = [emptyColorBlock("Red")];
    expect(hasColor(blocks, "Red")).toBe(true);
    expect(hasColor(blocks, "Black")).toBe(false);
  });
});
