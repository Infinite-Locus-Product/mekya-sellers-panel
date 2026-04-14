import { describe, it, expect } from "vitest";
import { getB2BProducts, getEditableProductDraftById, getProducts } from "./products";

describe("products data layer", () => {
  it("getProducts returns a non-empty array", async () => {
    const products = await getProducts();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  it("getProducts returns products with required listed-product fields", async () => {
    const products = await getProducts();
    const first = products[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("name");
    expect(first).toHaveProperty("articleNumber");
    expect(first).toHaveProperty("category");
    expect(first).toHaveProperty("sizes");
    expect(first).toHaveProperty("colors");
    expect(first).toHaveProperty("inventoryType");
    expect(first).toHaveProperty("price");
    expect(first).toHaveProperty("quantity");
    expect(first).toHaveProperty("status");
  });

  it("getEditableProductDraftById returns edit form data for a valid product id", async () => {
    const products = await getProducts();
    const draft = await getEditableProductDraftById(products[0].id);
    expect(draft).not.toBeNull();
    expect(draft?.id).toBe(products[0].id);
    expect(Array.isArray(draft?.sizes)).toBe(true);
    expect(Array.isArray(draft?.colors)).toBe(true);
    expect(draft).toHaveProperty("description");
  });

  it("getB2BProducts returns a transformed list for b2b listing", async () => {
    const b2bProducts = await getB2BProducts();
    expect(Array.isArray(b2bProducts)).toBe(true);
    expect(b2bProducts.length).toBeGreaterThan(0);
    expect(b2bProducts[0].id.startsWith("b2b-")).toBe(true);
  });
});
