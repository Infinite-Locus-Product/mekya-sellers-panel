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
