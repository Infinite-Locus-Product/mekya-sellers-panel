import { describe, it, expect } from "vitest";
import { PIPELINE_STATUS_LABELS } from "@/lib/tableTypes";
import type { ListOrdersParams } from "@/lib/api/orders";

/**
 * The dashboard's Recent Orders status filter is multi-select. This pins the two rules the
 * query builder has to honour, since getting either wrong fails silently rather than
 * erroring:
 *
 *  - An empty selection must omit `statuses` entirely. Sending `statuses: []` would be a
 *    filter matching nothing, so the table would come back empty instead of unfiltered.
 *  - Selections are passed straight through as the backend's own labels — it ORs them via
 *    set membership, so no client-side widening is needed.
 */
function buildStatusesParam(selected: string[]): Pick<ListOrdersParams, "statuses"> {
  return selected.length > 0 ? { statuses: selected } : {};
}

describe("dashboard status filter (multi-select)", () => {
  it("omits `statuses` entirely when nothing is selected", () => {
    expect(buildStatusesParam([])).toEqual({});
    expect("statuses" in buildStatusesParam([])).toBe(false);
  });

  it("passes a single selection through unchanged", () => {
    expect(buildStatusesParam(["Pending"])).toEqual({ statuses: ["Pending"] });
  });

  it("passes every selection through, for the backend to OR", () => {
    expect(buildStatusesParam(["Pending", "Cancelled"])).toEqual({
      statuses: ["Pending", "Cancelled"],
    });
  });

  it("only ever offers labels the backend recognises", () => {
    // Every option in the dropdown comes from this list, so a selection can't be a
    // near-miss spelling that matches nothing server-side.
    for (const label of PIPELINE_STATUS_LABELS) {
      expect(typeof label).toBe("string");
      expect(label.trim()).toBe(label);
    }
    expect(PIPELINE_STATUS_LABELS).toContain("Partially Cancelled");
    expect(PIPELINE_STATUS_LABELS).not.toContain("all");
  });
});
