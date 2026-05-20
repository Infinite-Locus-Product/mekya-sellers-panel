import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"

function FeatureHighlight({
  icon,
  title,
  description,
}: Readonly<{
  icon: ReactNode
  title: string
  description: string
}>) {
  return (
    <div className="flex gap-3 rounded-xl border border-[#004C5E]/10 bg-white/45 p-3 shadow-sm backdrop-blur-sm">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#004C5E]/12 text-[#004C5E]"
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

interface AuthPageShellProps {
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

/** Full-page split layout (no modal) — mirrors admin auth visuals. */
export function AuthPageShell({ title, description, children, footer }: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#004C5E]/10 via-[#E8E9E8] to-[#dbeafe] p-10 lg:flex">
        <div
          className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-[#004C5E]/5 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-16 bottom-24 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl"
          aria-hidden
        />

        <div className="relative flex items-center gap-2">
          <Image src="/logo/mekyalogo.png" alt="Mekya" width={48} height={48} />
          <span className="font-mekya-brand text-3xl font-extrabold tracking-tight text-[#004C5E]">
            Mekya Seller
          </span>
        </div>

        <div className="relative max-w-md space-y-6">
          <div className="space-y-2">
            <p className="text-2xl font-semibold leading-snug text-foreground">
              Your racks, runway, and revenue—curated in one studio.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Built for clothing brands: sign in to shape collections, fulfill drops, and spotlight reels
              without juggling five tabs.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FeatureHighlight
              title="Dashboard"
              description="Pulse on sales, traffic, and what's moving today."
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
                  />
                </svg>
              }
            />
            <FeatureHighlight
              title="Products"
              description="Styles, sizes, fabrics, and drops—kept wardrobe-ready."
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m18 0a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 10.5m18 0v6.75A2.25 2.25 0 0118.75 19.5h-13.5A2.25 2.25 0 013 17.25V10.5"
                  />
                </svg>
              }
            />
            <FeatureHighlight
              title="Orders"
              description="Pick, pack, and track shipments without the chaos."
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              }
            />
            <FeatureHighlight
              title="Reels"
              description="Short-form fits and launches that feel on-brand."
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              }
            />
            <div className="sm:col-span-2">
              <FeatureHighlight
                title="Profile"
                description="Store story, contacts, and how buyers recognize your label."
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="mb-2 flex items-center gap-2 lg:hidden">
            <Image src="/logo/mekyalogo.png" alt="Mekya" width={28} height={28} />
            <span className="font-mekya-brand text-base font-extrabold tracking-tight text-[#004C5E]">
              Mekya Seller
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <div className="mt-2 text-sm text-muted-foreground">{description}</div>
            ) : null}
          </div>
          {children}
          {footer ? <div className="text-center text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </div>
    </div>
  )
}

export function AuthFooterLink({
  prompt,
  href,
  label,
}: {
  prompt: string
  href: string
  label: string
}) {
  return (
    <p>
      {prompt}{" "}
      <Link href={href} className="font-medium text-[#004C5E] underline-offset-4 hover:underline">
        {label}
      </Link>
    </p>
  )
}
