import type React from "react"
import type { Metadata, Viewport } from "next"
import { Amiri, Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ServiceWorkerRegister } from "@/components/pwa/sw-register"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sw" dir="ltr">
      <body className={`${geist.variable} ${amiri.variable} font-sans antialiased`}>
        <Header />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <Footer />
        <Toaster />
        <Analytics />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
