const DEV_BROWSER_PROXY_PREFIX = "/__api-proxy";

/**
 * Base URL for `ApiClient` / browser `fetch`.
 *
 * In **development**, the browser uses a same-origin prefix (`/__api-proxy`) so
 * requests are proxied by Next (`next.config.ts` rewrites) and avoid CORS. SSR
 * and Node still call the configured backend URL directly.
 *
 * In **production**, uses `NEXT_PUBLIC_API_URL` (required for deployed API host).
 */
export function getPublicApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") ?? "";

  if (process.env.NODE_ENV === "development") {
    if (typeof window !== "undefined") {
      return DEV_BROWSER_PROXY_PREFIX;
    }
  }

  return configured;
}
