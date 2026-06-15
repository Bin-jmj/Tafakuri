"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

interface HadithCollectionCardProps {
  title: string
  description: string
  category: string
  count: number
}

export function HadithCollectionCard({ title, description, category, count }: HadithCollectionCardProps) {
  return (
    <Link href={`/hadith/${encodeURIComponent(category)}`}>
      <Card className="group cursor-pointer overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-white/80 transition-transform duration-300 group-hover:scale-110" />

          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-xs font-semibold text-gray-800">{count} Hadithi</span>
          </div>
        </div>

        <div className="p-4 bg-white">
          <h3 className="font-semibold text-base mb-1 text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </Card>
    </Link>
  )
}
