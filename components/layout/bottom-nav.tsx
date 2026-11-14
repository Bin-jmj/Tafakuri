"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, HandHeart, Home, Library, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { MobileNav } from "./mobile-nav"
import { ZERO_PRAYER_OFFSETS, type PrayerOffsets } from "@/lib/utils/prayer-times"

// Primary destinations only — the long tail (Hadith, Adhkar, Sauti, Video,
// Makala, Tafuta, Profil) lives in the "Zaidi" sheet so every tap target
// stays comfortably large, like a native app tab bar.
const tabs = [
  { href: "/", label: "Nyumbani", icon: Home },
  { href: "/dua", label: "Dua", icon: HandHeart },
  { href: "/quran", label: "Qur'ani", icon: BookOpen },
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
      {/* Reuses the full categorized drawer for the non-primary destinations. */}
      <MobileNav
        prayerOffsets={prayerOffsets}
        open={moreOpen}
        onOpenChange={setMoreOpen}
        hideTrigger
      />

      <nav
        aria-label="Menyu kuu"
        className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/80 pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.06)] backdrop-blur-md supports-[backdrop-filter]:bg-background/70 lg:hidden"
      >
        <div className="mx-auto grid h-16 max-w-md grid-cols-5">
          {tabs.map((tab) => {
            const active = isTabActive(tab.href)
            const Icon = tab.icon
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className="flex min-h-11 flex-col items-center justify-center gap-0.5 outline-none focus-visible:bg-muted/60"
              >
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-200",
                    active ? "bg-primary/15" : "bg-transparent",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[22px] w-[22px] transition-colors duration-200",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                    strokeWidth={active ? 2.25 : 1.9}
                    fill={active ? "currentColor" : "none"}
                    fillOpacity={active ? 0.12 : undefined}
                  />
                </span>
                <span
                  className={cn(
                    "text-[11px] leading-none transition-colors duration-200",
                    active ? "font-medium text-primary" : "text-muted-foreground",
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
            className="flex min-h-11 flex-col items-center justify-center gap-0.5 outline-none focus-visible:bg-muted/60"
          >
            <span
              className={cn(
                "flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-200",
                moreActive ? "bg-primary/15" : "bg-transparent",
              )}
            >
              <MoreHorizontal
                className={cn(
                  "h-[22px] w-[22px] transition-colors duration-200",
                  moreActive ? "text-primary" : "text-muted-foreground",
                )}
                strokeWidth={moreActive ? 2.25 : 1.9}
              />
            </span>
            <span
              className={cn(
                "text-[11px] leading-none transition-colors duration-200",
                moreActive ? "font-medium text-primary" : "text-muted-foreground",
              )}
            >
              Zaidi
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
