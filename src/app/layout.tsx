import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { BODY_HYDRATION_CLEANUP_SCRIPT } from "@/lib/bodyHydrationCleanup"
import { AppProviders } from "./providers"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Mekya Seller Portal",
  description: "Mekya Seller Portal",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="body-hydration-cleanup-before-interactive"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: BODY_HYDRATION_CLEANUP_SCRIPT }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} overflow-x-hidden`}
      >
        <AppProviders>{children}</AppProviders>
        <script
          id="body-hydration-cleanup-after-content"
          dangerouslySetInnerHTML={{ __html: BODY_HYDRATION_CLEANUP_SCRIPT }}
        />
      </body>
    </html>
  )
}
