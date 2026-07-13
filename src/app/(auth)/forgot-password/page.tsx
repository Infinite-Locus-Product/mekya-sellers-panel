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

type Step = "email" | "sent"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { user, status } = useAuth()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
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
      setStep("sent")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed"
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
      title={step === "email" ? "Reset password" : "Check your email"}
      description={
        step === "email" ? (
          <span>Enter the email address for your seller account. If it matches, we&apos;ll send you a password reset link.</span>
        ) : (
          <span>If an account exists for that email, a reset link is on its way. Open it to choose a new password.</span>
        )
      }
      footer={<AuthFooterLink prompt="Remember it?" href="/login" label="Back to sign in" />}
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
                  "Send reset link"
                )}
              </Button>
            </form>
          )}

          {step === "sent" && (
            <div className="space-y-4 text-center">
              <Button type="button" className="w-full" onClick={() => router.push("/login")}>
                Back to sign in
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthPageShell>
  )
}
