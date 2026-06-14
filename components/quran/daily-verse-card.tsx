"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bookmark, BookmarkCheck, Copy, Download, Share2, Sparkles } from "lucide-react"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useToast } from "@/hooks/use-toast"
import { shareContent, copyToClipboard } from "@/lib/utils/share"
import { drawShareImage, downloadCanvasAsImage } from "@/lib/utils/share-image"
import type { QuranVerse } from "@/lib/types"

interface DailyVerseCardProps {
  verse: QuranVerse
  surahName?: string
}

export function DailyVerseCard({ verse, surahName }: DailyVerseCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const { toast } = useToast()
  const [downloading, setDownloading] = useState(false)

  const bookmarked = isBookmarked("quran_verse", verse.id)
  const reference = `${surahName ?? `Surah ${verse.surahNumber}`} (${verse.surahNumber}:${verse.verseNumber})`

  const TAFSIR_LIMIT = 160
  const tafsirTrimmed =
    verse.tafsir && verse.tafsir.length > TAFSIR_LIMIT
      ? `${verse.tafsir.slice(0, TAFSIR_LIMIT).trimEnd()}...`
      : verse.tafsir

  const handleBookmark = async () => {
    const wasBookmarked = bookmarked
    const ok = await toggleBookmark("quran_verse", verse.id)
    if (!ok) return
    toast(
      wasBookmarked
        ? { title: "Alama imeondolewa", description: "Aya imeondolewa kwenye alama zako" }
        : { title: "Alama imewekwa", description: "Aya imehifadhiwa kwenye alama zako" },
    )
  }

  const handleShare = async () => {
    const text = `${reference}\n\n${verse.arabicText}\n\n${verse.swahiliTranslation}`
    const shared = await shareContent("Aya ya Leo", text)
    if (!shared) {
      toast({ title: "Kushiriki hakuwezekani", description: "Nakili maandishi badala yake" })
    }
  }

  const handleCopy = async () => {
    const text = `${reference}\n\n${verse.arabicText}\n\n${verse.swahiliTranslation}`
    const copied = await copyToClipboard(text)
    toast(
      copied
        ? { title: "Imenakiliwa", description: "Aya imenakiliwa kwenye clipboard" }
        : { title: "Kunakili kumeshindikana", description: "Tafadhali jaribu tena", variant: "destructive" },
    )
  }

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    try {
      const canvas = drawShareImage({
        title: "Aya ya Leo",
        meta: reference,
        arabicText: verse.arabicText,
        translation: verse.swahiliTranslation,
        noteLabel: "Fundisho",
        note: verse.moral,
        theme: "blue",
      })
      downloadCanvasAsImage(canvas, "aya")
      toast({ title: "Imepakuliwa", description: "Aya imepakuliwa kama picha" })
    } catch {
      toast({ title: "Imeshindikana kupakua", variant: "destructive" })
    } finally {
      setDownloading(false)
    }
  }, [verse, reference, toast])

  return (
    <Card className="h-full overflow-hidden border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-br from-accent/10 to-primary/5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-1 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Aya ya Leo
            </CardTitle>
            <CardDescription className="text-base">{reference}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmark}
            aria-label={bookmarked ? "Ondoa alama" : "Weka alama"}
          >
            {bookmarked ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-6 space-y-5">
        <p className="arabic-text text-foreground leading-loose text-center">{verse.arabicText}</p>
        <p className="text-lg leading-relaxed text-foreground">{verse.swahiliTranslation}</p>

        {verse.moral && (
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-accent">Fundisho: </span>
              {verse.moral}
            </p>
          </div>
        )}

        {tafsirTrimmed && (
          <div className="bg-muted/40 border border-border/50 rounded-lg p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Tafsiri: </span>
              {tafsirTrimmed}
            </p>
          </div>
        )}

        <Link href={`/quran/${verse.surahNumber}#aya-${verse.verseNumber}`}>
          <Button variant="ghost" size="sm" className="w-full justify-between text-primary hover:text-primary">
            Soma Zaidi kwenye Sura
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <div className="grid grid-cols-3 gap-2 pt-1 mt-auto">
          <Button variant="outline" size="sm" onClick={handleCopy} className="bg-transparent">
            <Copy className="mr-1.5 h-4 w-4" />
            Nakili
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="bg-transparent">
            <Share2 className="mr-1.5 h-4 w-4" />
            Shiriki
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={downloading} className="bg-transparent">
            <Download className="mr-1.5 h-4 w-4" />
            Pakua
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
