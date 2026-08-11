/**
 * Base URL for `ApiClient` / browser `fetch`.
 *
 * Always the backend host from `NEXT_PUBLIC_API_URL` — the browser, SSR and Node
 * all call it directly, in every environment. The backend must therefore allow
 * the app origin via CORS.
 */
export function getPublicApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") ?? "";
}
