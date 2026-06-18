"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import {
  Sun,
  Moon,
  Landmark,
  Repeat,
  MoonStar,
  BedDouble,
  AlarmClock,
  Plane,
  Sparkles,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Asubuhi: Sun,
  Jioni: Moon,
  Sala: Landmark,
  "Baada ya Sala": Repeat,
  Tahajjud: MoonStar,
  "Kabla ya Kulala": BedDouble,
  Kuamka: AlarmClock,
  Safari: Plane,
}

const CATEGORY_COLORS: Record<string, string> = {
  Asubuhi: "from-amber-400 to-amber-500",
  Jioni: "from-indigo-500 to-indigo-600",
  Sala: "from-teal-500 to-teal-600",
  "Baada ya Sala": "from-cyan-500 to-cyan-600",
  Tahajjud: "from-violet-500 to-violet-600",
  "Kabla ya Kulala": "from-blue-500 to-blue-600",
  Kuamka: "from-orange-500 to-orange-600",
  Safari: "from-sky-500 to-sky-600",
}

interface AdhkarCollectionCardProps {
  title: string
  description: string
  category: string
  count: number
}

export function AdhkarCollectionCard({ title, description, category, count }: AdhkarCollectionCardProps) {
  const Icon = CATEGORY_ICONS[category] ?? Sparkles
  const gradient = CATEGORY_COLORS[category] ?? "from-primary to-teal-700"

  return (
    <Link href={`/adhkar/${encodeURIComponent(category)}`}>
      <Card className="group cursor-pointer overflow-hidden border shadow-md hover:shadow-xl hover:border-primary/30 transition-all duration-300">
        <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon className="h-12 w-12 text-white transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute top-3 right-3 bg-background px-3 py-1 rounded-full">
            <span className="text-xs font-semibold text-foreground">{count} Adhkar</span>
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
