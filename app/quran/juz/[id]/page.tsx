import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VerseCard } from "@/components/quran/verse-card"
import { BismillahCard } from "@/components/quran/bismillah-card"
import { createClient } from "@/lib/supabase/server"
import { mapQuranVerse, mapSurah } from "@/lib/mappers"
import { quranJuzList } from "@/lib/quran-juz"
import type { QuranVerse, Surah } from "@/lib/types" // QuranVerse used in SurahGroup

interface JuzPageProps {
  params: Promise<{ id: string }>
}

interface SurahGroup {
  surah: Surah
  verses: QuranVerse[]
}

export default async function JuzPage({ params }: JuzPageProps) {
  const { id } = await params
  const juzNumber = Number.parseInt(id)
  const juz = quranJuzList.find((j) => j.number === juzNumber)

  if (!juz || isNaN(juzNumber)) notFound()

  const supabase = await createClient()

  // Collect all surah IDs involved in this Juz
  const surahIds: number[] = []
  for (let s = juz.startSurah; s <= juz.endSurah; s++) surahIds.push(s)

  const [{ data: surahRows }, { data: verseRows }] = await Promise.all([
    supabase.from("surahs").select("*").in("id", surahIds).order("id", { ascending: true }),
    supabase
      .from("quran_verses")
      .select("*")
      .in("surah_number", surahIds)
      .order("surah_number", { ascending: true })
      .order("verse_number", { ascending: true }),
  ])

  const surahMap = new Map((surahRows ?? []).map(mapSurah).map((s) => [s.id, s]))

  // Filter verses to only those within the Juz boundaries
  const juzVerses = (verseRows ?? [])
    .map(mapQuranVerse)
    .filter((v) => {
      const sn = v.surahNumber
      const vn = v.verseNumber
      if (sn === juz.startSurah && sn === juz.endSurah) return vn >= juz.startVerse && vn <= juz.endVerse
      if (sn === juz.startSurah) return vn >= juz.startVerse
      if (sn === juz.endSurah) return vn <= juz.endVerse
      return true // middle surah — all verses included
    })

  const groups: SurahGroup[] = surahIds
    .map((sid) => {
      const surah = surahMap.get(sid)
      if (!surah) return null
      const verses = juzVerses.filter((v) => v.surahNumber === sid)
      return { surah, verses }
    })
    .filter((g): g is SurahGroup => g !== null && g.verses.length > 0)

  const startSurah = surahMap.get(juz.startSurah)
  const endSurah = surahMap.get(juz.endSurah)

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <Link href="/quran">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Rudi kwenye Orodha ya Juzuu
        </Button>
      </Link>

      {/* Juz header */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 rotate-45 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-md">
                <span className="text-lg font-bold -rotate-45 text-primary">{juz.number}</span>
              </div>
              <div>
                <CardTitle className="text-2xl mb-1">Juzu ya {juz.number}</CardTitle>
                <CardDescription className="text-sm">
                  {startSurah?.name}
                  {juz.startSurah !== juz.endSurah ? ` — ${endSurah?.name}` : ""}
                </CardDescription>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="arabic-text text-3xl leading-none mb-1">{juz.arabicName}</p>
              <div className="flex gap-2 justify-end flex-wrap">
                <Badge variant="secondary">{juz.totalVerses} Aya</Badge>
                <Badge variant="outline">{surahIds.length} Sura</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Verses grouped by surah */}
      <div className="space-y-8">
        {groups.map(({ surah, verses }) => (
          <div key={surah.id}>
            {/* Surah divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-9 h-9 rotate-45 bg-muted flex items-center justify-center rounded-sm">
                <span className="text-xs font-bold -rotate-45">{surah.id}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-lg">{surah.name}</h2>
                  <span className="arabic-text text-xl text-muted-foreground">{surah.arabicName}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {surah.revelationType === "Makki" ? "Makka" : "Madina"} · {verses.length} aya katika juzu hii
                </p>
              </div>
              <Link href={`/quran/${surah.id}`}>
                <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:text-primary text-xs">
                  <BookOpen className="h-3.5 w-3.5" />
                  Soma Sura Yote
                </Button>
              </Link>
            </div>

            {surah.id !== 1 && surah.id !== 9 && <BismillahCard />}

            {/* Verse cards */}
            <div className="space-y-3">
              {verses.map((verse) => (
                <VerseCard key={verse.id} verse={verse} />
              ))}
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <Card>
            <CardHeader>
              <CardDescription>Aya za juzu hii hazijawekwa bado. Tafadhali rudi baadaye.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
}
