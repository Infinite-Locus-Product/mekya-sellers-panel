import { describe, it, expect } from "vitest";
import { getPaginationRange, type PaginationSlot } from "./paginationRange";

const show = (slots: PaginationSlot[]) =>
  slots.map((s) => (s === "ellipsis" ? "…" : String(s))).join(" ");

describe("getPaginationRange", () => {
  it("matches the specified shape on the first page", () => {
    expect(show(getPaginationRange(1, 10))).toBe("1 2 3 4 … 10");
  });

  it("starts the window at the selected page", () => {
    // Selecting 4 shows 4,5,6 — the window begins at the current page, it doesn't centre.
    expect(show(getPaginationRange(4, 10))).toBe("1 … 4 5 6 … 10");
  });

  it("clamps the window so it never collides with the pinned last page", () => {
    expect(show(getPaginationRange(8, 10))).toBe("1 … 7 8 9 10");
    expect(show(getPaginationRange(10, 10))).toBe("1 … 7 8 9 10");
  });

  it("always pins page 1 and the last page", () => {
    for (const current of [1, 2, 5, 9, 20]) {
      const slots = getPaginationRange(current, 20);
      expect(slots[0]).toBe(1);
      expect(slots[slots.length - 1]).toBe(20);
    }
  });

  it("shows every page without gaps when they all fit", () => {
    expect(show(getPaginationRange(1, 1))).toBe("1");
    expect(show(getPaginationRange(1, 2))).toBe("1 2");
    expect(show(getPaginationRange(2, 3))).toBe("1 2 3");
    expect(show(getPaginationRange(3, 5))).toBe("1 2 3 4 5");
  });

  it("renders a one-page gap as the page itself rather than an ellipsis", () => {
    // Leading gap only: page 2 is shown instead of "…" hiding a single destination.
    expect(show(getPaginationRange(3, 8))).toBe("1 2 3 4 5 … 8");
    // Gaps on both sides, each one page wide, so both expand and nothing is hidden.
    expect(show(getPaginationRange(3, 7))).toBe("1 2 3 4 5 6 7");
    expect(show(getPaginationRange(1, 6))).toBe("1 2 3 4 5 6");
  });

  it("never repeats a page", () => {
    for (let total = 1; total <= 30; total++) {
      for (let current = 1; current <= total; current++) {
        const nums = getPaginationRange(current, total).filter(
          (s): s is number => s !== "ellipsis"
        );
        expect(new Set(nums).size).toBe(nums.length);
      }
    }
  });

  it("always includes the current page so the active state is visible", () => {
    for (let total = 1; total <= 30; total++) {
      for (let current = 1; current <= total; current++) {
        expect(getPaginationRange(current, total)).toContain(current);
      }
    }
  });

  it("keeps page numbers ascending and never emits adjacent ellipses", () => {
    for (let total = 1; total <= 30; total++) {
      for (let current = 1; current <= total; current++) {
        const slots = getPaginationRange(current, total);
        let last = 0;
        slots.forEach((slot, i) => {
          if (slot === "ellipsis") {
            expect(slots[i - 1]).not.toBe("ellipsis");
            return;
          }
          expect(slot).toBeGreaterThan(last);
          last = slot;
        });
      }
    }
  });

  it("clamps out-of-range and non-integer input instead of throwing", () => {
    expect(show(getPaginationRange(0, 10))).toBe("1 2 3 4 … 10");
    expect(show(getPaginationRange(99, 10))).toBe("1 … 7 8 9 10");
    expect(show(getPaginationRange(1, 0))).toBe("1");
    expect(show(getPaginationRange(2.7, 10))).toBe("1 2 3 4 … 10");
  });
});
