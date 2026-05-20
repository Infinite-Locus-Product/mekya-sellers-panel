const PREFIX = "mekya_seller_secure_"

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(PREFIX + key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(PREFIX + key, value)
  } catch {
    /* quota / private mode */
  }
}

function safeRemove(key: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}

/** Namespaced localStorage for tokens — client-only. */
export const secureStorage = {
  getItem: safeGet,
  setItem: safeSet,
  removeItem: safeRemove,
}
