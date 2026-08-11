/** A rendered pagination slot: a page number, or a gap marker. */
export type PaginationSlot = number | "ellipsis";

/** Pages shown between the pinned first and last page. */
export const PAGINATION_WINDOW_SIZE = 3;

/**
 * Page numbers to render: page 1 pinned, then a sliding window of
 * {@link PAGINATION_WINDOW_SIZE} pages, then the last page pinned, with an ellipsis
 * wherever pages are skipped.
 *
 *   total 10, current 1  ->  1 [2 3 4] … 10
 *   total 10, current 4  ->  1 … [4 5 6] … 10
 *   total 10, current 8  ->  1 … [7 8 9] 10
 *
 * The window *starts* at the current page rather than centring on it, so clicking the
 * page after the window advances the whole window rather than nudging it by one. It is
 * clamped so it never runs past the pinned last page (which is why current 8 shows 7-9,
 * not 8-10 — 10 is already pinned and must not appear twice).
 *
 * Never emits a duplicate page, and never emits an ellipsis standing in for a single
 * hidden page — "1 … 3" wastes the same space as "1 2 3" while hiding a destination.
 */
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  windowSize: number = PAGINATION_WINDOW_SIZE
): PaginationSlot[] {
  const total = Math.max(1, Math.floor(totalPages));
  const current = Math.min(Math.max(1, Math.floor(currentPage)), total);
  const size = Math.max(1, Math.floor(windowSize));

  // Few enough pages that everything fits: no pinning or gaps needed.
  if (total <= size + 2) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // Window lives strictly between page 1 and the last page, so it starts no earlier than
  // 2 and ends no later than total - 1.
  const start = Math.max(2, Math.min(current, total - size));
  const end = Math.min(start + size - 1, total - 1);

  const slots: PaginationSlot[] = [1];

  if (start > 2) {
    // A gap of exactly one page is shown as that page — an ellipsis would take the same
    // room while hiding somewhere to click.
    if (start === 3) slots.push(2);
    else slots.push("ellipsis");
  }

  for (let page = start; page <= end; page++) slots.push(page);

  if (end < total - 1) {
    if (end === total - 2) slots.push(total - 1);
    else slots.push("ellipsis");
  }

  slots.push(total);
  return slots;
}
