"use client"

import { Card } from "@/components/ui/card"
import { quranJuzList } from "@/lib/quran-juz"
import type { Surah } from "@/lib/types"
import Link from "next/link"

interface JuzListProps {
  surahs: Surah[]
}

export function JuzList({ surahs }: JuzListProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {quranJuzList.map((juz) => {
        const startSurah = surahs.find((s) => s.id === juz.startSurah)
        const endSurah = surahs.find((s) => s.id === juz.endSurah)

        return (
          <Link key={juz.number} href={`/quran/juz/${juz.number}`}>
            <Card className="transition-all hover:shadow-md hover:border-primary/30 cursor-pointer border p-4">
              <div className="flex items-center gap-4">
                {/* Diamond number */}
                <div className="flex-shrink-0 w-12 h-12 rotate-45 bg-muted flex items-center justify-center rounded-sm">
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
                <div className="flex-shrink-0 text-right">
                  <p className="arabic-text text-xl mb-1 leading-none">{juz.arabicName}</p>
                  <p className="text-xs text-muted-foreground">{juz.totalVerses} Aya</p>
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
