import { notFound } from "next/navigation"
import { VerseCard } from "@/components/quran/verse-card"
import { BismillahCard } from "@/components/quran/bismillah-card"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { mapQuranVerse, mapSurah } from "@/lib/mappers"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface QuranSurahPageProps {
  params: Promise<{ id: string }>
}

export default async function QuranSurahPage({ params }: QuranSurahPageProps) {
  const { id } = await params
  const surahId = Number.parseInt(id)
  const supabase = await createClient()

  const [{ data: surahRow }, { data: verseRows }] = await Promise.all([
    supabase.from("surahs").select("*").eq("id", surahId).maybeSingle(),
    supabase.from("quran_verses").select("*").eq("surah_number", surahId).order("verse_number", { ascending: true }),
  ])

  if (!surahRow) {
    notFound()
  }

  const surah = mapSurah(surahRow)
  const verses = (verseRows ?? []).map(mapQuranVerse)

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <Link href="/quran">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Rudi kwenye Sura
        </Button>
      </Link>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{surah.name}</CardTitle>
              <CardDescription className="arabic-text text-3xl mb-4">{surah.arabicName}</CardDescription>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary">{surah.numberOfVerses} Aya</Badge>
                <Badge variant="outline">{surah.revelationType}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {surahId !== 1 && surahId !== 9 && <BismillahCard />}

      <div className="space-y-4">
        {verses.length > 0 ? (
          verses.map((verse) => <VerseCard key={verse.id} verse={verse} />)
        ) : (
          <Card>
            <CardHeader>
              <CardDescription>Aya za sura hii hazijawekwa bado. Tafadhali rudi baadaye.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
}
