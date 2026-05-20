import { getPublicApiUrl } from "@/lib/env"
import { ApiClient } from "./apiClient"
import { secureStorage } from "./secureStorage"
import type { AdminUser, AuthTokens, LoginCredentials, RegisterPayload } from "./types"

const STORAGE_KEY = "auth_tokens"
/** Client-only mock auth: no API calls; remove when backend auth is wired. */
const MOCK_SESSION_KEY = "auth_mock_session"
const USER_PROFILE_KEY = "auth_user_profile"

function buildMockUser(email: string, displayName?: string): AdminUser {
  const trimmed = email.trim() || "user@local.dev"
  const normalizedEmail = trimmed.includes("@") ? trimmed : `${trimmed}@local.dev`
  const localPart = normalizedEmail.split("@")[0] ?? "user"
  return {
    id: `mock_${normalizedEmail.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 48)}`,
    email: normalizedEmail,
    name: displayName?.trim() || localPart || "User",
    isVerified: true,
  }
}

function createMockTokens(): AuthTokens {
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`
  return {
    accessToken: `mock_access_${suffix}`,
    refreshToken: `mock_refresh_${suffix}`,
    expiresAt: Date.now() + 24 * 3600_000,
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
    secureStorage.removeItem(MOCK_SESSION_KEY)
    secureStorage.removeItem(USER_PROFILE_KEY)
    this.tokens = null
    this.api.setAuthTokens(null)
  }

  private isMockSession(): boolean {
    return secureStorage.getItem(MOCK_SESSION_KEY) === "1"
  }

  private saveMockSession(user: AdminUser, tokens: AuthTokens): void {
    secureStorage.setItem(MOCK_SESSION_KEY, "1")
    secureStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user))
    this.saveTokens(tokens)
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
    const user = buildMockUser(credentials.email)
    const tokens = createMockTokens()
    this.saveMockSession(user, tokens)
    return { user, tokens }
  }

  async register(
    payload: RegisterPayload
  ): Promise<{ user: AdminUser; tokens: AuthTokens }> {
    const user = buildMockUser(payload.email, payload.fullName)
    const tokens = createMockTokens()
    this.saveMockSession(user, tokens)
    return { user, tokens }
  }

  async logout(): Promise<void> {
    try {
      if (this.tokens && !this.isMockSession()) {
        await this.api.post("/auth/logout", { refreshToken: this.tokens.refreshToken })
      }
    } catch {
      /* still clear local session */
    } finally {
      this.clearTokens()
    }
  }

  async getCurrentUser(): Promise<AdminUser> {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated")
    }

    if (this.isMockSession()) {
      const raw = secureStorage.getItem(USER_PROFILE_KEY)
      if (!raw) {
        throw new Error("Not authenticated")
      }
      try {
        const user = JSON.parse(raw) as AdminUser
        if (user?.id && user?.email) {
          return user
        }
      } catch {
        /* fall through */
      }
      throw new Error("Not authenticated")
    }

    const response = await this.api.get<{ user: AdminUser }>("/auth/me")
    if (!response.success || !response.data?.user) {
      throw new Error("Failed to load user")
    }
    return response.data.user
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
