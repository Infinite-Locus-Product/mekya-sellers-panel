"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { AuthFooterLink, AuthPageShell } from "@/components/auth/auth-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { authService } from "@/lib/auth/authService"

/** Email link flow: `/reset-password?email=...&token=...` sets a new password in one step. */
function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token")?.trim() ?? ""
  const email = params.get("email")?.trim() ?? ""
  const { user, status } = useAuth()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === "ready" && user) {
      router.replace("/dashboard")
    }
  }, [status, user, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !email) {
      toast.error("Missing reset link details. Open the link from your email.")
      return
    }
    if (password !== confirm) {
      toast.error("Passwords do not match")
      return
    }
    setSubmitting(true)
    try {
      await authService.completePasswordResetWithToken(email, token, password)
      toast.success("Password updated")
      router.replace("/login")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Reset failed"
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

  if (!token || !email) {
    return (
      <AuthPageShell
        title="Reset link incomplete"
        description="This page needs the link from your reset email. You can start again below."
        footer={
          <AuthFooterLink prompt="Wrong link?" href="/forgot-password" label="Start forgot-password" />
        }
      >
        <Card>
          <CardContent className="pt-6">
            <Button type="button" className="w-full" onClick={() => router.push("/forgot-password")}>
              Forgot password flow
            </Button>
          </CardContent>
        </Card>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell
      title="Set a new password"
      description="Choose a strong password for your seller account."
      footer={<AuthFooterLink prompt="Remember it?" href="/login" label="Back to sign in" />}
    >
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New password
              </label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm" className="text-sm font-medium">
                Confirm password
              </label>
              <Input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Save password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthPageShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
