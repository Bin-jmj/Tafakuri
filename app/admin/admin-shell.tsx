"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  ScrollText,
  FileText,
  Hand,
  Users,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Moon,
  HardDrive,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const navItems = [
  {
    label: "Dashibodi",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Hadithi",
    href: "/admin/hadithi",
    icon: ScrollText,
    badge: "12",
  },
  {
    label: "Makala",
    href: "/admin/makala",
    icon: FileText,
    badge: "8",
  },
  {
    label: "Dua & Adhkar",
    href: "/admin/dua",
    icon: Hand,
    badge: "24",
  },
  {
    label: "Aya za Qur'an",
    href: "/admin/qurani",
    icon: BookOpen,
  },
  {
    label: "Vitabu",
    href: "/admin/vitabu",
    icon: BookOpen,
    badge: "4",
  },
  {
    label: "Watumiaji",
    href: "/admin/watumiaji",
    icon: Users,
  },
  {
    label: "Mipangilio ya Drive",
    href: "/admin/settings/drive",
    icon: HardDrive,
  },
  {
    label: "Muda wa Maudhui",
    href: "/admin/settings/muda",
    icon: Clock,
  },
]

interface AdminUser {
  name: string
  email: string
  initials: string
}

function Sidebar({ user, onClose }: { user: AdminUser; onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Moon className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm text-sidebar-foreground leading-none">Tafakuri</p>
            <p className="text-xs text-muted-foreground mt-0.5">Paneli ya Wasimamizi</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Maudhui</p>
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className={cn("text-xs h-5 px-1.5", isActive && "bg-primary-foreground/20 text-primary-foreground border-0")}
                >
                  {item.badge}
                </Badge>
              )}
              {isActive && <ChevronRight className="h-3 w-3 opacity-70" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{user.initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <Separator className="my-2" />
        <Link href="/" className="w-full">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" />
            Rudi Kwenye Tovuti
          </Button>
        </Link>
      </div>
    </aside>
  )
}

export function AdminShell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar user={user} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full z-10">
            <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-background">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Moon className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">Paneli ya Wasimamizi</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
