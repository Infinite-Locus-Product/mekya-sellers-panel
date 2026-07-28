import type { ApiResponse, AuthTokens } from "./types"

// Preserved: ApiError is seller-specific — authService.ts catches it by statusCode.
// field/code mirror the backend's { success:false, error:{code,message,field} }
// envelope — callers can branch on these instead of matching message text, which
// is the only way to translate an error reliably regardless of its exact wording.
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly field?: string,
    public readonly code?: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export interface ApiClientConfig {
  baseURL: string
  timeout?: number
}

// callback type injected by AuthService — no circular dependency.
export type RefreshHandler = () => Promise<boolean>

// shared error message extractor for all response shapes.
export function extractApiErrorMessage(
  payload: unknown,
  fallback = "Request failed",
  depth = 0
): string {
  if (depth >= 3) return fallback
  if (payload == null) return fallback
  if (typeof payload === "string" && payload.trim()) return payload.trim()
  if (typeof payload !== "object") return fallback

  if (Array.isArray(payload)) {
    const first = payload[0]
    if (typeof first === "string" && first.trim()) return first.trim()
    if (first && typeof first === "object" && !Array.isArray(first)) {
      const item = first as Record<string, unknown>
      if (typeof item.msg === "string" && item.msg.trim()) return item.msg.trim()
      const nested = extractApiErrorMessage(first, "", depth + 1)
      if (nested) return nested
    }
    return fallback
  }

  const o = payload as Record<string, unknown>

  if (typeof o.msg === "string" && o.msg.trim()) return o.msg.trim()
  if (typeof o.message === "string" && o.message.trim()) return o.message.trim()
  if (typeof o.detail === "string" && o.detail.trim()) return o.detail.trim()
  if (Array.isArray(o.detail) && o.detail.length > 0) {
    const fromDetail = extractApiErrorMessage(o.detail[0], "", depth + 1)
    if (fromDetail) return fromDetail
  }
  if (typeof o.error === "string" && o.error.trim()) return o.error.trim()
  if (o.error && typeof o.error === "object" && !Array.isArray(o.error)) {
    const nested = extractApiErrorMessage(o.error, "", depth + 1)
    if (nested) return nested
  }
  if (Array.isArray(o.errors) && o.errors.length > 0) {
    const fromErrors = extractApiErrorMessage(o.errors[0], "", depth + 1)
    if (fromErrors) return fromErrors
  }

  return fallback
}

// Pulls `field`/`code` from our own { error: { field, code } } envelope shape
// (top-level or one level under `error`) — deliberately not recursive/lenient
// like extractApiErrorMessage, since these are only meaningful on our own
// well-known envelope, not arbitrary third-party error shapes.
function extractApiErrorField(payload: unknown): string | undefined {
  if (payload == null || typeof payload !== "object" || Array.isArray(payload)) return undefined
  const o = payload as Record<string, unknown>
  if (typeof o.field === "string" && o.field.trim()) return o.field.trim()
  if (o.error && typeof o.error === "object" && !Array.isArray(o.error)) {
    const nested = (o.error as Record<string, unknown>).field
    if (typeof nested === "string" && nested.trim()) return nested.trim()
  }
  return undefined
}

function extractApiErrorCode(payload: unknown): string | undefined {
  if (payload == null || typeof payload !== "object" || Array.isArray(payload)) return undefined
  const o = payload as Record<string, unknown>
  if (typeof o.code === "string" && o.code.trim()) return o.code.trim()
  if (o.error && typeof o.error === "object" && !Array.isArray(o.error)) {
    const nested = (o.error as Record<string, unknown>).code
    if (typeof nested === "string" && nested.trim()) return nested.trim()
  }
  return undefined
}

export class ApiClient {
  // proactive refresh fires 5 s before token expires.
  private static readonly ACCESS_EXPIRY_SKEW_MS = 5_000

  private baseURL: string
  private timeout: number
  private authTokens: AuthTokens | null = null
  // injected by AuthService — ApiClient never imports AuthService.
  private refreshHandler: RefreshHandler | null = null
  private refreshPromise: Promise<boolean> | null = null

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, "")
    this.timeout = config.timeout ?? 15000
  }

  setAuthTokens(tokens: AuthTokens | null): void {
    this.authTokens = tokens
  }

  getAuthTokens(): AuthTokens | null {
    return this.authTokens
  }

  // wired in AuthService constructor.
  setRefreshHandler(handler: RefreshHandler | null): void {
    this.refreshHandler = handler
  }

  private authHeader(): Record<string, string> {
    const token = this.authTokens?.accessToken?.trim()
    if (!token) return {}
    // Always attach when present; expiry is handled by ensureAccessTokenFresh / 401
    // retry — omitting on expiry causes false "Missing Authorization" on POST/PATCH.
    return { Authorization: `Bearer ${token}` }
  }

  // runs before every non-auth request.
  private async ensureAccessTokenFresh(): Promise<void> {
    if (this.authTokens === null || this.refreshHandler === null) return
    const skewedExpiry = this.authTokens.expiresAt - ApiClient.ACCESS_EXPIRY_SKEW_MS
    const accessStale =
      this.authTokens.accessToken.length > 0 && Date.now() >= skewedExpiry
    const hasRefresh = this.authTokens.refreshToken.length > 0
    if (accessStale && hasRefresh) {
      await this.tryRefresh()
    }
  }

  private async parseBody(res: Response): Promise<unknown> {
    const text = await res.text()
    if (!text) return null
    try {
      return JSON.parse(text) as unknown
    } catch {
      return text
    }
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.refreshHandler === null || this.authTokens === null) return false
    if (this.refreshPromise) return this.refreshPromise
    this.refreshPromise = this.refreshHandler()
      .catch(() => false)
      .finally(() => { this.refreshPromise = null })
    return this.refreshPromise
  }

  // AbortController errors vary by browser/runtime.
  private static isAbortError(error: unknown): boolean {
    if (error instanceof DOMException && error.name === "AbortError") return true
    if (error instanceof Error && error.name === "AbortError") return true
    return false
  }

  private async request<T>(
    path: string,
    init: { method?: string; headers?: Record<string, string>; body?: unknown },
    // skipRefresh prevents re-entry on auth-only calls
    // (login, refresh, logout). timeoutMs allows per-call override.
    options: { skipRefresh?: boolean; timeoutMs?: number } = {}
  ): Promise<ApiResponse<T>> {
    const timeoutMs = options.timeoutMs ?? this.timeout
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)

    // buildHeaders as a function so it can be called twice (initial + retry after refresh).
    const buildHeaders = (): Record<string, string> => ({
      "Content-Type": "application/json",
      ...this.authHeader(),
      ...(init.headers as Record<string, string> | undefined),
    })

    const body =
      init.body !== undefined && init.method !== "GET" && init.method !== undefined
        ? JSON.stringify(init.body)
        : undefined

    const doFetch = (): Promise<Response> =>
      fetch(`${this.baseURL}${path}`, {
        method: init.method ?? "GET",
        headers: buildHeaders(),
        body,
        signal: controller.signal,
      })

    try {
      // Proactive: refresh before the request if token is near expiry.
      if (!options.skipRefresh) {
        await this.ensureAccessTokenFresh()
      }
      let res = await doFetch()

      // Reactive: on 401, refresh once and retry. 401 means _extract_bearer fired
      // before any business logic — safe to retry for all HTTP methods.
      // Fresh AbortController for the retry so the original timeout does not carry over.
      if (res.status === 401 && !options.skipRefresh && (await this.tryRefresh())) {
        clearTimeout(id)
        const retryController = new AbortController()
        const retryId = setTimeout(() => retryController.abort(), timeoutMs)
        try {
          res = await fetch(`${this.baseURL}${path}`, {
            method: init.method ?? "GET",
            headers: buildHeaders(),
            body,
            signal: retryController.signal,
          })
        } finally {
          clearTimeout(retryId)
        }
      }

      const rawPayload = await this.parseBody(res)

      if (
        res.ok &&
        rawPayload &&
        typeof rawPayload === "object" &&
        !Array.isArray(rawPayload) &&
        !("success" in (rawPayload as object))
      ) {
        const obj = rawPayload as Record<string, unknown>
        if ("error" in obj || "errors" in obj) {
          const msg = extractApiErrorMessage(rawPayload, "")
          // Preserved: throw ApiError so authService.ts statusCode checks still work.
          if (msg) {
            throw new ApiError(
              msg,
              res.status,
              extractApiErrorField(rawPayload),
              extractApiErrorCode(rawPayload)
            )
          }
        }
        return { success: true, data: rawPayload as T }
      }

      const payload = rawPayload

      if (!res.ok) {
        const msg = extractApiErrorMessage(payload, `Request failed (${res.status})`)
        // Preserved: throw ApiError (not plain Error) — authService.ts instanceof checks.
        throw new ApiError(msg, res.status, extractApiErrorField(payload), extractApiErrorCode(payload))
      }

      if (
        payload &&
        typeof payload === "object" &&
        "success" in payload &&
        (payload as ApiResponse<T>).success === false
      ) {
        throw new ApiError(
          extractApiErrorMessage(payload, "Request failed"),
          res.status,
          extractApiErrorField(payload),
          extractApiErrorCode(payload)
        )
      }

      return payload as ApiResponse<T>
    } catch (error) {
      if (ApiClient.isAbortError(error)) {
        throw new Error("Request timed out. Please try again.")
      }
      throw error
    } finally {
      clearTimeout(id)
    }
  }

  async post<T>(
    path: string,
    body?: unknown,
    options: { skipRefresh?: boolean; timeoutMs?: number } = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "POST", body }, options)
  }

  async get<T>(
    path: string,
    options: { skipRefresh?: boolean; timeoutMs?: number } = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "GET" }, options)
  }

  async put<T>(
    path: string,
    body?: unknown,
    options: { skipRefresh?: boolean; timeoutMs?: number } = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "PUT", body }, options)
  }

  async patch<T>(
    path: string,
    body?: unknown,
    options: { skipRefresh?: boolean; timeoutMs?: number } = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "PATCH", body }, options)
  }

  async delete<T>(
    path: string,
    options: { skipRefresh?: boolean } = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "DELETE" }, options)
  }
}
