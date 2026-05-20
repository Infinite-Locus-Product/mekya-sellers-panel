"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { authService } from "@/lib/auth/authService"
import type { AdminUser, LoginCredentials, RegisterPayload } from "@/lib/auth/types"

type AuthStatus = "idle" | "loading" | "ready"

interface AuthContextValue {
  user: AdminUser | null
  status: AuthStatus
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>("idle")

  useEffect(() => {
    let cancelled = false

    const run = async (): Promise<void> => {
      authService.syncApiTokens()
      if (!authService.isAuthenticated()) {
        if (!cancelled) setStatus("ready")
        return
      }
      if (!cancelled) setStatus("loading")
      try {
        const u = await authService.getCurrentUser()
        if (!cancelled) setUser(u)
      } catch {
        if (!cancelled) {
          setUser(null)
          void authService.logout()
        }
      } finally {
        if (!cancelled) setStatus("ready")
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { user: u } = await authService.login(credentials)
    setUser(u)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user: u } = await authService.register(payload)
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const u = await authService.getCurrentUser()
    setUser(u)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, status, login, register, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
