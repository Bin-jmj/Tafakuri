"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { MobileNav } from "./mobile-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookOpen, ChevronDown, Clock, FileText, Headphones, Home, Library, LogIn, LogOut, Moon, Scroll, Search, Sparkles, Sun, User, HandHeart, Settings2, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNextPrayer } from "@/hooks/use-next-prayer"
import { useUser } from "@/hooks/use-user"
import { signOut } from "@/app/auth/actions"
import { ZERO_PRAYER_OFFSETS, type PrayerOffsets } from "@/lib/utils/prayer-times"

const navItems = [
  { href: "/", label: "Nyumbani", icon: Home },
  { href: "/quran", label: "Qur'ani", icon: BookOpen },
  { href: "/hadith", label: "Hadith", icon: Scroll },
  { href: "/dua", label: "Dua", icon: HandHeart },
  { href: "/adhkar", label: "Adhkar", icon: Sparkles },
  { href: "/vitabu", label: "Vitabu", icon: Library },
  { href: "/profile", label: "Alama", icon: User },
]

const moreNavItems = [
  { href: "/sauti", label: "Sauti", icon: Headphones },
  { href: "/video", label: "Video", icon: Video },
  { href: "/articles", label: "Makala", icon: FileText },
]

export function Header({ prayerOffsets = ZERO_PRAYER_OFFSETS }: { prayerOffsets?: PrayerOffsets }) {
  const pathname = usePathname()
  const nextPrayer = useNextPrayer(prayerOffsets)
  const { resolvedTheme, setTheme } = useTheme()
  const { user, loading: userLoading } = useUser()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const showLogin = mounted && !userLoading && !user
  const showLogout = mounted && !userLoading && !!user

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 pt-safe backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        <MobileNav prayerOffsets={prayerOffsets} />

        <Link href="/" className="hidden items-center gap-2 lg:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary p-1.5">
            <Image src="/logo.png" alt="Tafakuri" width={40} height={40} className="h-full w-full object-contain" priority />
          </div>
          <span className="font-bold text-lg">Tafakuri</span>
        </Link>

        {nextPrayer && (
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-sm lg:hidden">
            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="font-medium">{nextPrayer.label}</span>
            <span>&middot;</span>
            <span className="text-muted-foreground">imebaki</span>
            <span>&middot;</span>
            <span className="font-medium tabular-nums">{nextPrayer.countdownHMS}</span>
          </div>
        )}

        <nav className="hidden lg:flex items-center gap-1 ml-auto">
          {navItems.map((item) => {
            const isLoginSlot = item.href === "/profile" && showLogin
            const isLogoutSlot = item.href === "/profile" && showLogout
            const isMoreActive = moreNavItems.some((m) => pathname.startsWith(m.href))

            if (isLogoutSlot) {
              return (
                <form action={signOut} key={item.href}>
                  <Button type="submit" variant="ghost" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Toka
                  </Button>
                </form>
              )
            }

            const Icon = isLoginSlot ? LogIn : item.icon
            const label = isLoginSlot ? "Ingia" : item.label
            const href = isLoginSlot ? "/auth/login" : item.href
            const isActive = !isLoginSlot && (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))

            // The "Zaidi" dropdown sits right before the profile/login slot.
            return (
              <div key={item.href} className="contents">
                {item.href === "/profile" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn("gap-1.5", isMoreActive && "bg-muted text-primary font-medium")}
                      >
                        Zaidi
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {moreNavItems.map((m) => (
                        <DropdownMenuItem key={m.href} asChild>
                          <Link href={m.href} className="gap-2">
                            <m.icon className="h-4 w-4" />
                            {m.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Link href={href}>
                  <Button
                    variant="ghost"
                    className={cn("gap-2", isActive && "bg-muted text-primary font-medium")}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                </Link>
              </div>
            )
          })}
          <Button
            variant="ghost"
            size="icon"
            title={mounted && resolvedTheme === "dark" ? "Washa mwanga" : "Zima mwanga"}
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {mounted && resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link href="/search">
            <Button variant="ghost" size="icon" className="ml-1" title="Tafuta">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="ghost" size="icon" title="Paneli ya Wasimamizi">
              <Settings2 className="h-4 w-4" />
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
