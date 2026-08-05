import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
const FIXED_LOCALE = "en-US"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatNumber(value: number): string {
  return value.toLocaleString(FIXED_LOCALE)
}

const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
}

export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS
): string {
  return date.toLocaleDateString(FIXED_LOCALE, options)
}

export function formatCurrencyINR(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`
}

/** Currency-aware formatter for API money shapes ({ amount, currency }), e.g. SAR/USD. */
export function formatMoney(money: { amount: number; currency: string }): string {
  try {
    return new Intl.NumberFormat(FIXED_LOCALE, {
      style: "currency",
      currency: money.currency,
      maximumFractionDigits: 0,
    }).format(money.amount)
  } catch {
    return `${money.currency} ${money.amount.toLocaleString(FIXED_LOCALE)}`
  }
}

/** Triggers a client-side download of an already-fetched Blob (e.g. an export or invoice PDF). */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/**
 * Locale and time zone for every rendered date.
 *
 * Pinned on purpose. `toLocaleDateString(undefined, …)` resolves differently on the server
 * (Node's locale/TZ, used for the initial HTML) than in the browser, which both produces a
 * hydration mismatch and can show a neighbouring day for anyone outside IST. Business
 * dates here are Indian, so IST is the correct reference — matching how money is already
 * pinned to en-IN above.
 */
const DATE_LOCALE = "en-IN"
const DATE_TIME_ZONE = "Asia/Kolkata"

/** e.g. "5 Aug 2026". Returns "—" for missing/unparseable input. */
export function formatOrderDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString(DATE_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: DATE_TIME_ZONE,
  })
}

/** e.g. "5 Aug 2026, 4:35 pm". Returns "—" for missing/unparseable input. */
export function formatOrderDateTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString(DATE_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: DATE_TIME_ZONE,
  })
}

/** Splits an ISO timestamp into pinned date + time parts for two-line display. */
export function splitOrderDateTime(iso: string | null | undefined): {
  date: string
  time: string
} {
  if (!iso) return { date: "—", time: "" }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { date: iso, time: "" }
  return {
    date: formatOrderDate(iso),
    time: d.toLocaleTimeString(DATE_LOCALE, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: DATE_TIME_ZONE,
    }),
  }
}
