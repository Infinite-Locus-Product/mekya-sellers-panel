import type { ApiResponse, AuthTokens } from "./types"

export interface ApiClientConfig {
  baseURL: string
  timeout?: number
}

export class ApiClient {
  private baseURL: string
  private timeout: number
  private authTokens: AuthTokens | null = null

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

  private authHeader(): Record<string, string> {
    if (!this.authTokens || Date.now() >= this.authTokens.expiresAt) {
      return {}
    }
    return { Authorization: `Bearer ${this.authTokens.accessToken}` }
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

  private async request<T>(
    path: string,
    init: { method?: string; headers?: Record<string, string>; body?: unknown }
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), this.timeout)

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.authHeader(),
      ...(init.headers as Record<string, string> | undefined),
    }

    const body =
      init.body !== undefined && init.method !== "GET" && init.method !== undefined
        ? JSON.stringify(init.body)
        : undefined

    try {
      const res = await fetch(`${this.baseURL}${path}`, {
        method: init.method ?? "GET",
        headers,
        body,
        signal: controller.signal,
      })

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
          const msg =
            typeof obj.message === "string"
              ? obj.message
              : typeof obj.error === "string"
                ? obj.error
                : "Request failed"
          throw new Error(msg)
        }
        return { success: true, data: rawPayload as T }
      }

      const payload = rawPayload

      if (!res.ok) {
        const msg =
          payload &&
          typeof payload === "object" &&
          "message" in payload &&
          typeof (payload as { message: unknown }).message === "string"
            ? (payload as { message: string }).message
            : `Request failed (${res.status})`
        throw new Error(msg)
      }

      if (
        payload &&
        typeof payload === "object" &&
        "success" in payload &&
        (payload as ApiResponse<T>).success === false
      ) {
        const msg =
          typeof (payload as ApiResponse<T>).message === "string"
            ? (payload as ApiResponse<T>).message!
            : "Request failed"
        throw new Error(msg)
      }

      return payload as ApiResponse<T>
    } finally {
      clearTimeout(id)
    }
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "POST", body })
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "GET" })
  }

  async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "PUT", body })
  }
}
