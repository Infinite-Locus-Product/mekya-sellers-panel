import { describe, expect, it } from "vitest";
import { describeSkus, listingStatus, toProductRow, type ProductListItem } from "./products";

function item(overrides: Partial<ProductListItem> = {}): ProductListItem {
  return {
    id: "p1",
    name: "Linen Shirt",
    thumbnail_url: null,
    sku: null,
    status: "published",
    article_number: "ART-1",
    category: "Shirts",
    sizes: ["S"],
    colors: ["Black"],
    inventory_type: "ready_to_ship",
    price: "₹499",
    quantity: 10,
    channels: "both",
    ...overrides,
  };
}

describe("listingStatus", () => {
  it("shows an open admin decision ahead of the publish state", () => {
    // A product live before approval existed can be queued as pending while still published.
    expect(listingStatus({ status: "published", approval_status: "pending" })).toBe(
      "pending_approval"
    );
    expect(listingStatus({ status: "draft", approval_status: "rejected" })).toBe("rejected");
  });

  it("falls back to the publish state once approved, or with no approval record", () => {
    expect(listingStatus({ status: "published", approval_status: "approved" })).toBe("active");
    expect(listingStatus({ status: "inactive", approval_status: "approved" })).toBe("inactive");
    expect(listingStatus({ status: "draft", approval_status: null })).toBe("inactive");
    expect(listingStatus({ status: "published" })).toBe("active");
  });
});

describe("new options pending approval", () => {
  it("flags a live product whose new colors/sizes await approval", () => {
    const row = toProductRow(item({ approval_status: "approved", has_pending_change: true }));
    expect(row.status).toBe("active");
    expect(row.hasPendingChange).toBe(true);
    expect(toProductRow(item()).hasPendingChange).toBe(false);
  });

  it("describes held SKUs as color / size", () => {
    expect(
      describeSkus([
        { sku: "S-NAVY-M", color: "Navy", size: "M", b2c_price: 700, b2b_price: 420 },
        { sku: "S-L", color: null, size: "L", b2c_price: null, b2b_price: null },
        { sku: "S-X", color: null, size: null, b2c_price: null, b2b_price: null },
      ])
    ).toBe("Navy / M, L, S-X");
  });
});

describe("toProductRow", () => {
  it("carries the rejection reason only for a rejected product", () => {
    expect(
      toProductRow(item({ approval_status: "rejected", rejection_reason: "Blurry images" }))
    ).toMatchObject({ status: "rejected", rejectionReason: "Blurry images" });
    expect(
      toProductRow(item({ approval_status: "approved", rejection_reason: "stale" })).rejectionReason
    ).toBeNull();
  });
});
