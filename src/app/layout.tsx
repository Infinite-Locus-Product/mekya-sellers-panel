import type { Metadata } from "next"
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
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} overflow-x-hidden`}
      >
        <script
          id="body-hydration-cleanup-start"
          dangerouslySetInnerHTML={{ __html: BODY_HYDRATION_CLEANUP_SCRIPT }}
        />
        <AppProviders>{children}</AppProviders>
        <script
          id="body-hydration-cleanup-end"
          dangerouslySetInnerHTML={{ __html: BODY_HYDRATION_CLEANUP_SCRIPT }}
        />
      </body>
    </html>
  )
}
