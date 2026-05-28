"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { AuthFooterLink, AuthPageShell } from "@/components/auth/auth-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { authService } from "@/lib/auth/authService"

type Step = "email" | "code" | "password" | "done"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { user, status } = useAuth()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === "ready" && user) {
      router.replace("/dashboard")
    }
  }, [status, user, router])

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await authService.requestPasswordReset(email.trim())
      toast.success("If an account exists, we sent reset instructions.")
      setStep("code")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCode(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await authService.verifyPasswordResetCode(email.trim(), code.trim())
      toast.success("Code verified")
      setStep("password")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid code"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleNewPassword(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error("Passwords do not match")
      return
    }
    setSubmitting(true)
    try {
      await authService.completePasswordResetWithCode(email.trim(), code.trim(), password)
      toast.success("Password updated")
      setStep("done")
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

  return (
    <AuthPageShell
      title={
        step === "email"
          ? "Reset password"
          : step === "code"
            ? "Enter verification code"
            : step === "password"
              ? "Choose a new password"
              : "You’re all set"
      }
      description={
        step === "email" ? (
          <span>Enter an email address that might be associated with your Mekya account. If it matches, we’ll send you a code.</span>
        ) : step === "code" ? (
          <span>Enter the code from your email.</span>
        ) : step === "password" ? (
          <span>Use a strong password you haven&apos;t used before.</span>
        ) : (
          <span>You can sign in with your new password.</span>
        )
      }
      footer={
        step === "done" ? null : (
          <AuthFooterLink prompt="Remember it?" href="/login" label="Back to sign in" />
        )
      }
    >
      <Card>
        <CardContent className="pt-6">
          {step === "email" && (
            <form onSubmit={handleEmail} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={handleCode} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  Verification code
                </label>
                <Input
                  id="code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter code"
                  autoComplete="one-time-code"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
              <button
                type="button"
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setStep("email")}
              >
                Use a different email
              </button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handleNewPassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="np" className="text-sm font-medium">
                  New password
                </label>
                <Input
                  id="np"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="npc" className="text-sm font-medium">
                  Confirm password
                </label>
                <Input
                  id="npc"
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
                    Saving…
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          )}

          {step === "done" && (
            <div className="space-y-4 text-center">
              <Button type="button" className="w-full" onClick={() => router.push("/login")}>
                Go to sign in
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthPageShell>
  )
}
