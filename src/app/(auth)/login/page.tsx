"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  PasswordFieldConcealIcon,
  PasswordFieldRevealIcon,
} from "@/components/auth/password-visibility-icons"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login, user, status } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === "ready" && user) {
      router.replace("/dashboard")
    }
  }, [status, user, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login({ email: email.trim(), password, rememberMe: remember })
      toast.success("Signed in")
      router.replace("/dashboard")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (status !== "ready" || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <AuthPageShell
      title="Welcome back"
      description="Sign in to the Mekya seller portal."
    >
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#004C5E] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <PasswordFieldConcealIcon /> : <PasswordFieldRevealIcon />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Remember me
            </label>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthPageShell>
  )
}
