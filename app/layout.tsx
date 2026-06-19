import type React from "react"
import type { Metadata, Viewport } from "next"
import { Amiri, Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ServiceWorkerRegister } from "@/components/pwa/sw-register"
import { InstallBanner } from "@/components/pwa/install-banner"
import { ThemeProvider } from "@/components/theme-provider"
import { AutoTheme } from "@/components/auto-theme"
import { createClient } from "@/lib/supabase/server"
import { mapRotationSettings } from "@/lib/mappers"
import { DEFAULT_ROTATION_SETTINGS, getPrayerOffsets } from "@/lib/utils/rotation"
import "./globals.css"

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
})

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

export const metadata: Metadata = {
  title: "Tafakuri - Maarifa ya Kiislamu",
  description: "Programu ya kusambaza maarifa ya Kiislamu kwa Kiswahili",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tafakuri",
  },
  // Prevent all browser auto-translation — Quranic text must never be
  // machine-translated as it would distort the meaning of the revelation.
  other: {
    google: "notranslate",
  },
}

export const viewport: Viewport = {
  themeColor: "#0f766e",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const { data: rotationRow } = await supabase.from("rotation_settings").select("*").eq("id", 1).single()
  const settings = rotationRow ? mapRotationSettings(rotationRow) : DEFAULT_ROTATION_SETTINGS
  const prayerOffsets = getPrayerOffsets(settings)

  return (
    <html lang="sw" dir="ltr" translate="no" suppressHydrationWarning>
      <body className={`${geist.variable} ${amiri.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <AutoTheme sunrise={settings.sunriseTime} sunset={settings.sunsetTime} />
          <Header prayerOffsets={prayerOffsets} />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
          <Toaster />
          <Analytics />
          <ServiceWorkerRegister />
          <InstallBanner />
        </ThemeProvider>
      </body>
    </html>
  )
}
