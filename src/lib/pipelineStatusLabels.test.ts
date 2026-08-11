import { describe, it, expect } from "vitest";
import { PIPELINE_STATUS_LABELS } from "./tableTypes";

/**
 * The backend matches `listOrders`' `statuses` param against these labels verbatim
 * (lower-cased on both sides, but not otherwise normalised), so a near-miss spelling
 * silently returns an empty list rather than erroring. The dashboard's status filter
 * previously offered "Canceled", which matched nothing for exactly that reason.
 *
 * Mirrors `BUCKET_LABEL` + its "Partially X" variants in
 * `backend/src/application/fulfillment/order_status.py`.
 */
const BACKEND_LABELS = [
  "Pending",
  "Processing",
  "Ready for Pickup",
  "Shipped",
  "Delivered",
  "Returned",
  "Cancelled",
  "Partially Processing",
  "Partially Ready for Pickup",
  "Partially Shipped",
  "Partially Delivered",
  "Partially Returned",
  "Partially Cancelled",
];

describe("PIPELINE_STATUS_LABELS", () => {
  it("covers every backend status label exactly, with no extras", () => {
    expect([...PIPELINE_STATUS_LABELS].sort()).toEqual([...BACKEND_LABELS].sort());
  });

  it("spells Cancelled with two Ls", () => {
    expect(PIPELINE_STATUS_LABELS).toContain("Cancelled");
    expect(PIPELINE_STATUS_LABELS).not.toContain("Canceled");
  });

  it("includes the partial variants the dashboard filter used to omit", () => {
    for (const label of [
      "Partially Returned",
      "Partially Cancelled",
      "Partially Delivered",
      "Partially Shipped",
      "Partially Processing",
      "Partially Ready for Pickup",
    ]) {
      expect(PIPELINE_STATUS_LABELS).toContain(label);
    }
  });

  it("has no duplicates", () => {
    expect(new Set(PIPELINE_STATUS_LABELS).size).toBe(PIPELINE_STATUS_LABELS.length);
  });
});
