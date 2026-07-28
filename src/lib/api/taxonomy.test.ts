import { describe, it, expect } from "vitest";
import {
  categoriesForGender,
  subcategoriesFor,
  templateFor,
  colorAttributeValues,
  tagsByGroup,
  type TaxonomyManifest,
} from "./taxonomy";

const MANIFEST: TaxonomyManifest = {
  schema_version: "1",
  version: "abc123",
  genders: [
    { code: "men", label: "Men", nav_tab: true },
    { code: "women", label: "Women", nav_tab: true },
  ],
  categories: [
    { slug: "topwear", name: "Topwear", genders: ["men", "women"] },
    { slug: "dresses", name: "Dresses", genders: ["women"] },
  ],
  subcategories: [
    { slug: "topwear-t-shirts", name: "T-Shirts", category_slug: "topwear", genders: ["men", "women"] },
    { slug: "topwear-formal-shirts", name: "Formal Shirts", category_slug: "topwear", genders: ["men"] },
  ],
  attributes: [
    {
      slug: "color",
      name: "Color",
      input_type: "DROPDOWN",
      level: "variant",
      group: "core",
      values: [{ slug: "black", name: "Black" }, { slug: "white", name: "White" }],
    },
    {
      slug: "fit",
      name: "Fit",
      input_type: "DROPDOWN",
      level: "product",
      group: "core",
      values: [{ slug: "slim", name: "Slim" }],
    },
  ],
  tags: [
    { slug: "season-summer", name: "Summer", tag_group: "season", saleor_attribute_slug: "season" },
    { slug: "season-winter", name: "Winter", tag_group: "season", saleor_attribute_slug: "season" },
    { slug: "occasion-casual", name: "Casual", tag_group: "occasion", saleor_attribute_slug: "occasion" },
  ],
  templates: {
    default: { required: [], optional: [] },
    "topwear-formal-shirts": { required: ["fit"], optional: [] },
  },
  size_systems: {
    alpha: { values: ["S", "M", "L"] },
  },
};

describe("categoriesForGender", () => {
  it("filters categories by gender", () => {
    expect(categoriesForGender(MANIFEST, "women").map((c) => c.slug)).toEqual(["topwear", "dresses"]);
    expect(categoriesForGender(MANIFEST, "men").map((c) => c.slug)).toEqual(["topwear"]);
  });

  it("returns empty when gender is undefined", () => {
    expect(categoriesForGender(MANIFEST, undefined)).toEqual([]);
  });
});

describe("subcategoriesFor", () => {
  it("filters by category and gender together", () => {
    expect(subcategoriesFor(MANIFEST, "topwear", "women").map((s) => s.slug)).toEqual([
      "topwear-t-shirts",
    ]);
    expect(subcategoriesFor(MANIFEST, "topwear", "men").map((s) => s.slug)).toEqual([
      "topwear-t-shirts",
      "topwear-formal-shirts",
    ]);
  });

  it("returns empty when category or gender is missing", () => {
    expect(subcategoriesFor(MANIFEST, undefined, "men")).toEqual([]);
    expect(subcategoriesFor(MANIFEST, "topwear", undefined)).toEqual([]);
  });
});

describe("templateFor", () => {
  it("returns the subcategory-specific override when one exists", () => {
    expect(templateFor(MANIFEST, "topwear-formal-shirts")).toEqual({ required: ["fit"], optional: [] });
  });

  it("falls back to the default template for an unmapped subcategory", () => {
    expect(templateFor(MANIFEST, "topwear-t-shirts")).toEqual({ required: [], optional: [] });
  });

  it("falls back to the default template when no subcategory is selected yet", () => {
    expect(templateFor(MANIFEST, undefined)).toEqual({ required: [], optional: [] });
  });
});

describe("colorAttributeValues", () => {
  it("returns the seeded color attribute's values", () => {
    expect(colorAttributeValues(MANIFEST).map((v) => v.name)).toEqual(["Black", "White"]);
  });
});

describe("tagsByGroup", () => {
  it("groups tags by tag_group", () => {
    const grouped = tagsByGroup(MANIFEST);
    expect(Object.keys(grouped)).toEqual(["season", "occasion"]);
    expect(grouped.season.map((t) => t.slug)).toEqual(["season-summer", "season-winter"]);
    expect(grouped.occasion.map((t) => t.slug)).toEqual(["occasion-casual"]);
  });
});
