"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { BookOpen, Clock, FileText, Home, Library, LogIn, Menu, Moon, Scroll, Search, Sparkles, Sun, User, HandHeart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNextPrayer } from "@/hooks/use-next-prayer"
import { useUser } from "@/hooks/use-user"

const navItems = [
  { href: "/", label: "Nyumbani", icon: Home },
  { href: "/quran", label: "Qur'ani", icon: BookOpen },
  { href: "/hadith", label: "Hadith", icon: Scroll },
  { href: "/dua", label: "Dua", icon: HandHeart },
  { href: "/adhkar", label: "Adhkar", icon: Sparkles },
  { href: "/vitabu", label: "Vitabu", icon: Library },
  { href: "/articles", label: "Makala", icon: FileText },
  { href: "/search", label: "Tafuta", icon: Search },
  { href: "/profile", label: "Alama", icon: User },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const nextPrayer = useNextPrayer()
  const { resolvedTheme, setTheme } = useTheme()
  const { user, loading: userLoading } = useUser()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const showLogin = mounted && !userLoading && !user

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Fungua menyu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary p-1">
                <Image src="/logo.png" alt="Tafakuri" width={36} height={36} className="h-full w-full object-contain" />
              </div>
              <span className="font-bold text-lg">Tafakuri</span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        {nextPrayer && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Sala Inayofuata</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-semibold">{nextPrayer.label}</span>
              <span className="text-sm text-muted-foreground">
                {nextPrayer.time.toLocaleTimeString("sw-TZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Africa/Dar_es_Salaam",
                })}
              </span>
            </div>
            <p className="text-xs text-primary mt-0.5">Baada ya {nextPrayer.countdown}</p>
          </div>
        )}

        <nav className="flex flex-col gap-2 mt-6">
          {navItems.map((item) => {
            const isLoginSlot = item.href === "/profile" && showLogin
            const Icon = isLoginSlot ? LogIn : item.icon
            const label = isLoginSlot ? "Ingia" : item.label
            const href = isLoginSlot ? "/auth/login" : item.href
            const isActive = !isLoginSlot && (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))

            return (
              <Link key={item.href} href={href} onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start gap-3", isActive && "bg-muted text-primary font-medium")}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <Separator className="mt-4" />

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 mt-2"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {mounted && resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-indigo-400" />
          )}
          {mounted && resolvedTheme === "dark" ? "Washa Mwanga" : "Zima Mwanga"}
        </Button>
      </SheetContent>
    </Sheet>
  )
}
