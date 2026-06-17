"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import {
  Star,
  HandHeart,
  Award,
  Users,
  GraduationCap,
  Gift,
  Smile,
  Shield,
  Sun,
  BookOpen,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Imani: Star,
  Ibada: HandHeart,
  Akhlaq: Award,
  Familia: Users,
  Elimu: GraduationCap,
  Sadaka: Gift,
  Adabu: Smile,
  Afya: Shield,
  Faraja: Sun,
}

const CATEGORY_COLORS: Record<string, string> = {
  Imani: "from-indigo-500 to-indigo-600",
  Ibada: "from-violet-500 to-violet-600",
  Akhlaq: "from-amber-500 to-amber-600",
  Familia: "from-pink-500 to-pink-600",
  Elimu: "from-blue-500 to-blue-600",
  Sadaka: "from-green-500 to-green-600",
  Adabu: "from-cyan-500 to-cyan-600",
  Afya: "from-teal-500 to-teal-600",
  Faraja: "from-orange-500 to-orange-600",
}

interface HadithCollectionCardProps {
  title: string
  description: string
  category: string
  count: number
}

export function HadithCollectionCard({ title, description, category, count }: HadithCollectionCardProps) {
  const Icon = CATEGORY_ICONS[category] ?? BookOpen
  const gradient = CATEGORY_COLORS[category] ?? "from-primary to-teal-700"

  return (
    <Link href={`/hadith/${encodeURIComponent(category)}`}>
      <Card className="group cursor-pointer overflow-hidden border shadow-md hover:shadow-xl hover:border-primary/30 transition-all duration-300">
        <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon className="h-12 w-12 text-white transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute top-3 right-3 bg-background px-3 py-1 rounded-full">
            <span className="text-xs font-semibold text-foreground">{count} Hadithi</span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-base mb-1 text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </Card>
    </Link>
  )
}
