import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ScrollText,
  FileText,
  Hand,
  BookOpen,
  Users,
  Plus,
  ArrowRight,
  HardDrive,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getDriveConnectionStatus } from "@/lib/drive/tokens"

const quickActions = [
  { label: "Ongeza Hadithi", href: "/admin/hadithi", icon: ScrollText },
  { label: "Ongeza Makala", href: "/admin/makala", icon: FileText },
  { label: "Ongeza Dua", href: "/admin/dua", icon: Hand },
  { label: "Ongeza Aya", href: "/admin/qurani", icon: BookOpen },
]

async function countRows(supabase: Awaited<ReturnType<typeof createClient>>, table: "hadiths" | "duas" | "adhkar" | "articles" | "quran_verses" | "media_items" | "profiles") {
  const { count } = await supabase.from(table).select("*", { count: "exact", head: true })
  return count ?? 0
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [hadithsCount, articlesCount, duasCount, adhkarCount, versesCount, mediaCount, usersCount, driveStatus] = await Promise.all([
    countRows(supabase, "hadiths"),
    countRows(supabase, "articles"),
    countRows(supabase, "duas"),
    countRows(supabase, "adhkar"),
    countRows(supabase, "quran_verses"),
    countRows(supabase, "media_items"),
    countRows(supabase, "profiles"),
    getDriveConnectionStatus(),
  ])

  const stats = [
    { title: "Hadithi Zote", value: hadithsCount, icon: ScrollText, href: "/admin/hadithi", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { title: "Makala Zote", value: articlesCount, icon: FileText, href: "/admin/makala", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    { title: "Dua & Adhkar", value: duasCount + adhkarCount, icon: Hand, href: "/admin/dua", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
    { title: "Aya za Qur'an", value: versesCount, icon: BookOpen, href: "/admin/qurani", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashibodi</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Karibu, Msimamizi — {new Date().toLocaleDateString("sw-TZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Mfumo Unafanya Kazi
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Vitendo vya Haraka</CardTitle>
            <CardDescription>Ongeza maudhui mapya haraka</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button variant="outline" className="w-full justify-start gap-3 h-10 text-sm font-normal hover:bg-primary/5 hover:border-primary/30">
                  <div className="w-6 h-6 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <action.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {action.label}
                  <Plus className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                </Button>
              </Link>
            ))}
            <Separator className="my-2" />
            <Link href="/admin/watumiaji">
              <Button variant="outline" className="w-full justify-start gap-3 h-10 text-sm font-normal hover:bg-primary/5 hover:border-primary/30">
                <div className="w-6 h-6 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <Users className="h-3.5 w-3.5 text-primary" />
                </div>
                Simamia Watumiaji
                <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
              </Button>
            </Link>
            <Link href="/admin/settings/drive">
              <Button variant="outline" className="w-full justify-start gap-3 h-10 text-sm font-normal hover:bg-primary/5 hover:border-primary/30">
                <div className="w-6 h-6 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <HardDrive className="h-3.5 w-3.5 text-primary" />
                </div>
                Mipangilio ya Drive
                {driveStatus.connected ? (
                  <CheckCircle2 className="h-3.5 w-3.5 ml-auto text-emerald-500" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                )}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Content Summary */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Muhtasari wa Maudhui</CardTitle>
            <CardDescription>Hali ya maudhui yote kwenye mfumo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Sura za Qur'an (Aya zilizoongezwa)", value: versesCount, icon: BookOpen, color: "bg-violet-500" },
                { label: "Hadithi", value: hadithsCount, icon: ScrollText, color: "bg-blue-500" },
                { label: "Makala", value: articlesCount, icon: FileText, color: "bg-emerald-500" },
                { label: "Dua & Adhkar", value: duasCount + adhkarCount, icon: Hand, color: "bg-amber-500" },
                { label: "Maktaba (Vitabu/Sauti/Video)", value: mediaCount, icon: BookOpen, color: "bg-rose-500" },
                { label: "Watumiaji", value: usersCount, icon: Users, color: "bg-cyan-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/40">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-sm flex-1">{item.label}</span>
                  <span className="text-lg font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
