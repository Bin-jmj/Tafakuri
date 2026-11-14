"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Home, Library, MoreHorizontal, Search, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { MobileNav } from "./mobile-nav"
import { ZERO_PRAYER_OFFSETS, type PrayerOffsets } from "@/lib/utils/prayer-times"

// Primary tabs only - the long tail (Hadith, Dua, Adhkar, Sauti, Video,
// Makala, Profil) lives in the "Zaidi" sheet so every tap target stays
// comfortably large, like a native app tab bar.
const tabs = [
  { href: "/", label: "Nyumbani", icon: Home },
  { href: "/quran", label: "Qur'ani", icon: BookOpen },
  { href: "/search", label: "Tafuta", icon: Search },
  { href: "/vitabu", label: "Vitabu", icon: Library },
]

export function BottomNav({ prayerOffsets = ZERO_PRAYER_OFFSETS }: { prayerOffsets?: PrayerOffsets }) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const isTabActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)
  const moreActive = !tabs.some((t) => isTabActive(t.href))

  return (
    <>
      {/* Reuses the full drawer for the non-primary destinations. */}
      <MobileNav
        prayerOffsets={prayerOffsets}
        open={moreOpen}
        onOpenChange={setMoreOpen}
        hideTrigger
      />

      <nav
        aria-label="Menyu kuu"
        className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 pb-safe backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden"
      >
        <div className="mx-auto grid h-16 max-w-md grid-cols-5">
          {tabs.map((tab) => {
            const active = isTabActive(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 transition-colors active:bg-muted/70",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <tab.icon className={cn("h-5 w-5", active && "fill-current/10")} strokeWidth={active ? 2.25 : 2} />
                <span className={cn("text-[11px] leading-none", active && "font-medium")}>{tab.label}</span>
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-expanded={moreOpen}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center gap-0.5 transition-colors active:bg-muted/70",
              moreActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <MoreHorizontal className="h-5 w-5" strokeWidth={moreActive ? 2.25 : 2} />
            <span className={cn("text-[11px] leading-none", moreActive && "font-medium")}>Zaidi</span>
          </button>
        </div>
      </nav>
    </>
  )
}
