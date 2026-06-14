"use client"

import { Card } from "@/components/ui/card"
import type { Surah } from "@/lib/types"
import Link from "next/link"
import { useMemo, useState } from "react"

interface SurahListProps {
  surahs: Surah[]
  sortOrder?: "ascending" | "descending"
}

export function SurahList({ surahs, sortOrder = "ascending" }: SurahListProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const sortedSurahs = useMemo(() => {
    const sorted = [...surahs]
    return sortOrder === "ascending"
      ? sorted.sort((a, b) => a.id - b.id)
      : sorted.sort((a, b) => b.id - a.id)
  }, [surahs, sortOrder])

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {sortedSurahs.map((surah) => {
        const isActive = selectedId === surah.id
        return (
          <Link
            key={surah.id}
            href={`/quran/${surah.id}`}
            onClick={() => setSelectedId(surah.id)}
          >
            <Card
              className={`transition-all hover:shadow-md cursor-pointer border p-4 ${
                isActive
                  ? "bg-primary/5 border-primary text-primary"
                  : "hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Diamond number badge */}
                <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center">
                  <div
                    className={`w-9 h-9 rotate-45 rounded-sm flex items-center justify-center ${
                      isActive ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold -rotate-45 ${
                        isActive ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {surah.id}
                    </span>
                  </div>
                </div>

                {/* Surah name + revelation type */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-bold text-base mb-0.5 truncate ${
                      isActive ? "text-primary" : ""
                    }`}
                  >
                    {surah.name}
                  </h3>
                  <p
                    className={`text-sm truncate ${
                      isActive ? "text-primary/80" : "text-muted-foreground"
                    }`}
                  >
                    {surah.revelationType === "Makki" ? "Makka" : "Madina"}
                  </p>
                </div>

                {/* Arabic name + verse count */}
                <div className="flex-shrink-0 text-right">
                  <p className="arabic-text text-xl mb-0.5 leading-none">{surah.arabicName}</p>
                  <p
                    className={`text-xs ${
                      isActive ? "text-primary/80" : "text-muted-foreground"
                    }`}
                  >
                    {surah.numberOfVerses} Aya
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
