/** Seller portal: single user kind — no role branching in UI. */
export interface AuthTokens {
  readonly accessToken: string
  readonly refreshToken: string
  readonly expiresAt: number
}

export interface AdminUser {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly isVerified: boolean
}

export interface LoginCredentials {
  readonly email: string
  readonly password: string
  readonly rememberMe?: boolean
}

export interface RegisterPayload {
  readonly fullName: string
  readonly email: string
  readonly password: string
  readonly phone?: string
  readonly company?: string
}

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
  timestamp?: string
}
