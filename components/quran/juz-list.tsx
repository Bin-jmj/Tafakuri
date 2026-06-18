"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { quranJuzList } from "@/lib/quran-juz"
import type { Surah } from "@/lib/types"
import Link from "next/link"

interface JuzListProps {
  surahs: Surah[]
  sortOrder?: "ascending" | "descending"
}

export function JuzList({ surahs, sortOrder = "ascending" }: JuzListProps) {
  const sortedJuz = useMemo(() => {
    const sorted = [...quranJuzList]
    return sortOrder === "ascending" ? sorted : sorted.reverse()
  }, [sortOrder])

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {sortedJuz.map((juz) => {
        const startSurah = surahs.find((s) => s.id === juz.startSurah)
        const endSurah = surahs.find((s) => s.id === juz.endSurah)

        return (
          <Link key={juz.number} href={`/quran/juz/${juz.number}`}>
            <Card className="overflow-hidden transition-all hover:shadow-md hover:border-primary/30 cursor-pointer border p-4">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Diamond number */}
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rotate-45 bg-muted flex items-center justify-center rounded-sm">
                  <span className="text-sm font-bold -rotate-45">{juz.number}</span>
                </div>

                {/* Juz info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Juzu ya {juz.number}</p>
                  <h3 className="font-bold text-base truncate">
                    {startSurah?.name}
                    {startSurah?.id !== endSurah?.id ? ` — ${endSurah?.name}` : ""}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Aya {juz.startVerse}–{juz.endVerse}
                  </p>
                </div>

                {/* Arabic name and verse count */}
                <div className="flex-shrink-0 max-w-[30%] text-right">
                  <p className="arabic-text text-base sm:text-xl mb-1 leading-tight break-words">{juz.arabicName}</p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">{juz.totalVerses} Aya</p>
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
