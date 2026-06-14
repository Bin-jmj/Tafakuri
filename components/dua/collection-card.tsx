"use client"

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"

interface CollectionCardProps {
  title: string
  description: string
  image: string
  category: string
  duaCount: number
}

export function CollectionCard({ title, description, image, category, duaCount }: CollectionCardProps) {
  return (
    <Link href={`/dua/${encodeURIComponent(category)}`}>
      <Card className="group cursor-pointer overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-xs font-semibold text-gray-800">{duaCount} Dua</span>
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
