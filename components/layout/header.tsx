"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MobileNav } from "./mobile-nav"
import { BookOpen, Clock, FileText, Home, Library, Scroll, Search, User, HandHeart, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNextPrayer } from "@/hooks/use-next-prayer"

const navItems = [
  { href: "/", label: "Nyumbani", icon: Home },
  { href: "/quran", label: "Qur'ani", icon: BookOpen },
  { href: "/hadith", label: "Hadith", icon: Scroll },
  { href: "/dua", label: "Dua", icon: HandHeart },
  { href: "/vitabu", label: "Vitabu", icon: Library },
  { href: "/articles", label: "Makala", icon: FileText },
  { href: "/profile", label: "Alama", icon: User },
]

export function Header() {
  const pathname = usePathname()
  const nextPrayer = useNextPrayer()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        <MobileNav />

        <Link href="/" className="hidden items-center gap-2 md:flex">
          <Image src="/logo.png" alt="Tafakuri" width={40} height={40} className="h-10 w-10 rounded-lg" priority />
          <span className="font-bold text-lg">Tafakuri</span>
        </Link>

        {nextPrayer && (
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-sm md:hidden">
            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="font-medium">{nextPrayer.label}</span>
            <span>&middot;</span>
            <span className="text-muted-foreground">imebaki</span>
            <span>&middot;</span>
            <span className="font-medium tabular-nums">{nextPrayer.countdownHMS}</span>
          </div>
        )}

        <nav className="hidden md:flex items-center gap-1 ml-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("gap-2", isActive && "bg-primary/10 text-primary")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
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
