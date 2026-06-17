"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { HandHeart, Sun, BookOpen, Smile, Shield, Utensils, Plane, Heart, Sparkles, Zap, GraduationCap } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Kila Siku": Sun,
  "Kuanza Jambo": Zap,
  "Shukrani": Smile,
  "Qurani": BookOpen,
  "Elimu": GraduationCap,
  "Faraja": Heart,
  "Afya": Shield,
  "Chakula": Utensils,
  "Safari": Plane,
  "Imani": Sparkles,
  "Familia": HandHeart,
}

const CATEGORY_COLORS: Record<string, string> = {
  "Kila Siku": "from-amber-400 to-amber-500",
  "Kuanza Jambo": "from-yellow-500 to-orange-500",
  "Shukrani": "from-green-500 to-green-600",
  "Qurani": "from-primary to-teal-700",
  "Elimu": "from-blue-500 to-blue-600",
  "Faraja": "from-rose-500 to-rose-600",
  "Afya": "from-teal-500 to-teal-600",
  "Chakula": "from-orange-500 to-orange-600",
  "Safari": "from-sky-500 to-sky-600",
  "Imani": "from-violet-500 to-violet-600",
  "Familia": "from-pink-500 to-pink-600",
}

interface CollectionCardProps {
  title: string
  description: string
  category: string
  duaCount: number
}

export function CollectionCard({ title, description, category, duaCount }: CollectionCardProps) {
  const Icon = CATEGORY_ICONS[category] ?? HandHeart
  const gradient = CATEGORY_COLORS[category] ?? "from-primary to-teal-700"

  return (
    <Link href={`/dua/${encodeURIComponent(category)}`}>
      <Card className="group cursor-pointer overflow-hidden border shadow-md hover:shadow-xl hover:border-primary/30 transition-all duration-300">
        <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon className="h-12 w-12 text-white transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute top-3 right-3 bg-background px-3 py-1 rounded-full">
            <span className="text-xs font-semibold text-foreground">{duaCount} Dua</span>
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
