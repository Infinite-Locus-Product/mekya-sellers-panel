import { getPublicApiUrl } from "@/lib/env"
import { ApiClient, ApiError } from "./apiClient"
import { secureStorage } from "./secureStorage"
import type { AdminUser, AuthTokens, LoginCredentials, RegisterPayload } from "./types"

const STORAGE_KEY = "auth_tokens"
const USER_PROFILE_KEY = "auth_user_profile"

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const base64 = (parts[1] ?? "").replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(atob(base64)) as Record<string, unknown>
  } catch {
    return null
  }
}

export class AuthService {
  private static instance: AuthService | undefined
  private tokens: AuthTokens | null = null
  readonly api: ApiClient

  private constructor() {
    this.api = new ApiClient({ baseURL: getPublicApiUrl(), timeout: 15000 })
    this.loadTokensFromStorage()
    this.api.setAuthTokens(this.tokens)
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private loadTokensFromStorage(): void {
    try {
      const raw = secureStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as AuthTokens
      if (parsed && typeof parsed.expiresAt === "number" && Date.now() >= parsed.expiresAt) {
        this.clearTokens()
        return
      }
      this.tokens = parsed
    } catch {
      this.clearTokens()
    }
  }

  private saveTokens(tokens: AuthTokens): void {
    secureStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
    this.tokens = tokens
    this.api.setAuthTokens(tokens)
  }

  private clearTokens(): void {
    secureStorage.removeItem(STORAGE_KEY)
    secureStorage.removeItem(USER_PROFILE_KEY)
    this.tokens = null
    this.api.setAuthTokens(null)
  }

  getTokens(): AuthTokens | null {
    return this.tokens
  }

  isAuthenticated(): boolean {
    return this.tokens !== null && Date.now() < this.tokens.expiresAt
  }

  syncApiTokens(): void {
    this.api.setAuthTokens(this.tokens)
  }

  async login(credentials: LoginCredentials): Promise<{ user: AdminUser; tokens: AuthTokens }> {
    let response: Awaited<ReturnType<typeof this.api.post<{ access_token: string; refresh_token: string; token_type: string }>>>
    try {
      response = await this.api.post<{ access_token: string; refresh_token: string; token_type: string }>(
        "/B2B/auth/login",
        { identifier: credentials.email, password: credentials.password, method: "email" },
      )
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) throw new Error("Invalid email or password.")
        if (err.statusCode === 403) throw new Error("Your account is pending admin approval.")
        if (err.statusCode === 423) throw new Error("Account locked after 3 failed attempts. Try again in 10 minutes.")
      }
      throw err
    }

    const { access_token, refresh_token } = response.data
    const claims = decodeJwtPayload(access_token)
    const tokens: AuthTokens = {
      accessToken: access_token,
      refreshToken: refresh_token,
      // Access token expires in 15 min — refresh slightly before that
      expiresAt: Date.now() + 14 * 60 * 1000,
    }
    const user: AdminUser = {
      id: String(claims?.sub ?? credentials.email),
      email: String(claims?.email ?? credentials.email),
      name: String(claims?.name ?? (credentials.email.split("@")[0] ?? "User")),
      isVerified: true,
    }

    this.saveTokens(tokens)
    secureStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user))
    return { user, tokens }
  }

  async refreshTokens(): Promise<void> {
    if (!this.tokens?.refreshToken) throw new Error("No refresh token available")
    const response = await this.api.post<{ access_token: string }>(
      "/B2B/auth/refresh",
      { refresh_token: this.tokens.refreshToken },
    )
    this.saveTokens({
      ...this.tokens,
      accessToken: response.data.access_token,
      expiresAt: Date.now() + 14 * 60 * 1000,
    })
  }

  async register(
    payload: RegisterPayload
  ): Promise<{ user: AdminUser; tokens: AuthTokens }> {
    // No register API specified — seller accounts are created by admin
    void payload
    throw new Error("New accounts are created by the Mekya admin team. Please contact support.")
  }

  async logout(): Promise<void> {
    this.clearTokens()
  }

  async getCurrentUser(): Promise<AdminUser> {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated")
    }

    // Use profile stored at login time
    const raw = secureStorage.getItem(USER_PROFILE_KEY)
    if (raw) {
      try {
        const user = JSON.parse(raw) as AdminUser
        if (user?.id && user?.email) return user
      } catch {
        /* fall through */
      }
    }

    // Fallback: decode claims from the JWT itself
    if (this.tokens?.accessToken) {
      const claims = decodeJwtPayload(this.tokens.accessToken)
      if (claims?.sub) {
        return {
          id: String(claims.sub),
          email: String(claims.email ?? claims.sub),
          name: String(claims.name ?? (String(claims.email ?? "").split("@")[0] ?? "User")),
          isVerified: true,
        }
      }
    }

    throw new Error("Not authenticated")
  }

  /** Step 1 — request reset email / code (same contract as b2b AuthService). */
  async requestPasswordReset(email: string): Promise<void> {
    const response = await this.api.post<unknown>("/auth/reset-password", { email })
    if (!response.success) {
      throw new Error("Password reset request failed")
    }
  }

  /** Step 2 — verify OTP / code from email (extend backend to match). */
  async verifyPasswordResetCode(email: string, code: string): Promise<void> {
    const response = await this.api.post<unknown>("/auth/reset-password/verify", {
      email,
      code,
    })
    if (!response.success) {
      throw new Error("Invalid or expired code")
    }
  }

  /** Step 3 — set new password after OTP (extend backend to match). */
  async completePasswordResetWithCode(
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> {
    const response = await this.api.post<unknown>("/auth/reset-password/complete", {
      email,
      code,
      newPassword,
    })
    if (!response.success) {
      throw new Error("Could not reset password")
    }
  }

  /** Deep-link from email with single-use token (alternative to OTP flow). */
  async completePasswordResetWithToken(token: string, newPassword: string): Promise<void> {
    const response = await this.api.post<unknown>("/auth/reset-password/confirm", {
      token,
      newPassword,
    })
    if (!response.success) {
      throw new Error("Could not reset password")
    }
  }
}

export const authService = AuthService.getInstance()
