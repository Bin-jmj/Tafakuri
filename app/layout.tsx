import type React from "react"
import type { Metadata, Viewport } from "next"
import { Amiri, Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ServiceWorkerRegister } from "@/components/pwa/sw-register"
import { ThemeProvider } from "@/components/theme-provider"
import { AutoTheme } from "@/components/auto-theme"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_ROTATION_SETTINGS } from "@/lib/utils/rotation"
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
  const { data: rotationRow } = await supabase.from("rotation_settings").select("sunrise_time, sunset_time").eq("id", 1).single()
  const settings = rotationRow
    ? { sunriseTime: rotationRow.sunrise_time?.slice(0, 5) ?? "06:00", sunsetTime: rotationRow.sunset_time?.slice(0, 5) ?? "18:00" }
    : { sunriseTime: DEFAULT_ROTATION_SETTINGS.sunriseTime, sunsetTime: DEFAULT_ROTATION_SETTINGS.sunsetTime }

  return (
    <html lang="sw" dir="ltr" suppressHydrationWarning>
      <body className={`${geist.variable} ${amiri.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <AutoTheme sunrise={settings.sunriseTime} sunset={settings.sunsetTime} />
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
          <Toaster />
          <Analytics />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  )
}
