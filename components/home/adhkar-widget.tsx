"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bookmark, BookmarkCheck, Copy, Download, Share2, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { createClient } from "@/lib/supabase/client"
import { mapAdhkar } from "@/lib/mappers"
import type { Adhkar } from "@/lib/types"
import { copyToClipboard, shareContent } from "@/lib/utils/share"
import { getCurrentSlot } from "@/lib/utils/time"
import { downloadCanvasAsImage, drawShareImage } from "@/lib/utils/share-image"

const ROTATE_MS = 2 * 60 * 1000 // 2 minutes

export function AdhkarWidget() {
  const { toast } = useToast()
  const { isBookmarked, toggleBookmark } = useBookmarks()

  const [slot, setSlot] = useState<"asubuhi" | "jioni">(getCurrentSlot)
  const [adhkarList, setAdhkarList] = useState<Adhkar[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROTATE_MS)
  const [downloading, setDownloading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Load adhkar for slot
  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase
      .from("adhkar")
      .select("*")
      .eq("slot", slot)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!active) return
        setAdhkarList((data ?? []).map(mapAdhkar))
        setCurrentIndex(0)
        setTimeLeft(ROTATE_MS)
      })
    return () => {
      active = false
    }
  }, [slot])

  // Auto-rotate every 2 min
  useEffect(() => {
    if (!adhkarList.length) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (tickRef.current) clearInterval(tickRef.current)

    setTimeLeft(ROTATE_MS)

    intervalRef.current = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % adhkarList.length)
      setTimeLeft(ROTATE_MS)
    }, ROTATE_MS)

    tickRef.current = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1000))
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [adhkarList])

  const adhkar = adhkarList[currentIndex]

  const handlePrev = () => {
    setCurrentIndex((i) => (i - 1 + adhkarList.length) % adhkarList.length)
    setTimeLeft(ROTATE_MS)
  }
  const handleNext = () => {
    setCurrentIndex((i) => (i + 1) % adhkarList.length)
    setTimeLeft(ROTATE_MS)
  }

  const bookmarked = adhkar ? isBookmarked("adhkar", adhkar.id) : false

  const handleBookmark = async () => {
    if (!adhkar) return
    const wasBookmarked = bookmarked
    const ok = await toggleBookmark("adhkar", adhkar.id)
    if (!ok) return
    toast(
      wasBookmarked
        ? { title: "Alama imeondolewa", description: "Adhkar imeondolewa kwenye alama zako" }
        : { title: "Imehifadhiwa", description: "Adhkar imehifadhiwa kwenye alama zako" },
    )
  }

  const handleCopy = async () => {
    if (!adhkar) return
    const text = `${adhkar.arabicText}\n\n${adhkar.swahiliTranslation}\n\n(${adhkar.transliteration})\n\nMara: ${adhkar.count} | Chanzo: ${adhkar.reference}`
    const ok = await copyToClipboard(text)
    toast({ title: ok ? "Imenakiliwa" : "Kunakili kumeshindikana", variant: ok ? "default" : "destructive" })
  }

  const handleShare = async () => {
    if (!adhkar) return
    const title = `Adhkar za ${slot === "asubuhi" ? "Asubuhi" : "Jioni"}`
    const text = `${adhkar.arabicText}\n\n${adhkar.swahiliTranslation}\n\nChanzo: ${adhkar.reference}`
    const shared = await shareContent(title, text)
    if (!shared) toast({ title: "Kushiriki hakuwezekani", description: "Nakili maandishi badala yake" })
  }

  const handleDownload = useCallback(async () => {
    if (!adhkar) return
    setDownloading(true)
    try {
      const isAsubuhi = slot === "asubuhi"
      const canvas = drawShareImage({
        title: isAsubuhi ? "Adhkar za Asubuhi" : "Adhkar za Jioni",
        meta: `Mara: ${adhkar.count}x`,
        arabicText: adhkar.arabicText,
        translation: adhkar.swahiliTranslation,
        noteLabel: "Faida",
        note: adhkar.benefit,
        source: adhkar.reference,
        theme: isAsubuhi ? "teal" : "blue",
      })
      downloadCanvasAsImage(canvas, "adhkar")
      toast({ title: "Imepakuliwa", description: "Adhkar imepakuliwa kama picha" })
    } catch {
      toast({ title: "Imeshindikana kupakua", variant: "destructive" })
    } finally {
      setDownloading(false)
    }
  }, [adhkar, slot, toast])

  // Progress: percentage of 10 min elapsed
  const progressPct = Math.round(((ROTATE_MS - timeLeft) / ROTATE_MS) * 100)
  const minutesLeft = Math.floor(timeLeft / 60000)
  const secondsLeft = Math.floor((timeLeft % 60000) / 1000)

  if (!adhkar) return null

  return (
    <Card className="overflow-hidden border-primary/20 shadow-lg" ref={cardRef}>
      <CardHeader className="pb-3 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {slot === "asubuhi" ? (
              <Sun className="h-5 w-5 text-amber-500 flex-shrink-0" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-400 flex-shrink-0" />
            )}
            <span className="font-bold text-lg truncate">
              Adhkar za {slot === "asubuhi" ? "Asubuhi" : "Jioni"}
            </span>
          </div>
          <Badge variant="outline" className="text-xs flex-shrink-0">
            {currentIndex + 1} / {adhkarList.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant={slot === "asubuhi" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs flex-1 sm:flex-none"
            onClick={() => setSlot("asubuhi")}
          >
            <Sun className="h-3 w-3 mr-1" />
            Asubuhi
          </Button>
          <Button
            variant={slot === "jioni" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs flex-1 sm:flex-none"
            onClick={() => setSlot("jioni")}
          >
            <Moon className="h-3 w-3 mr-1" />
            Jioni
          </Button>
        </div>
        {/* 10-min rotation progress */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Inabadilika kwa kila dakika 2</span>
            <span>{minutesLeft}:{String(secondsLeft).padStart(2, "0")} iliyobaki</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Left: Arabic text + translation */}
          <div className="space-y-4">
            <div className="text-center bg-muted/30 rounded-xl p-5 border border-border/50">
              <p
                className="arabic-text text-foreground leading-loose mb-3"
                style={{ fontSize: "1.45rem", direction: "rtl" }}
              >
                {adhkar.arabicText}
              </p>
              <p className="text-sm text-muted-foreground italic">{adhkar.transliteration}</p>
            </div>
            <p className="text-base leading-relaxed text-foreground">{adhkar.swahiliTranslation}</p>
          </div>

          {/* Right: meta, benefit, actions */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground lg:border-t lg:pt-3">
              <span><span className="font-medium text-foreground">Mara:</span> {adhkar.count}x</span>
              <span className="hidden sm:inline">•</span>
              <span><span className="font-medium text-foreground">Chanzo:</span> {adhkar.reference}</span>
            </div>

            <div className="bg-primary/5 border border-primary/15 rounded-lg p-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-primary">Faida: </span>
                {adhkar.benefit}
              </p>
            </div>

            {/* Navigation + Actions */}
            <div className="flex flex-col gap-2 mt-auto">
              <div className="grid grid-cols-4 gap-1.5">
                <Button variant="outline" size="sm" onClick={handleBookmark} className="bg-transparent text-xs px-1">
                  {bookmarked ? <BookmarkCheck className="h-3.5 w-3.5 sm:mr-1 text-primary" /> : <Bookmark className="h-3.5 w-3.5 sm:mr-1" />}
                  <span className="hidden sm:inline">Hifadhi</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy} className="bg-transparent text-xs px-1">
                  <Copy className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Nakili</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} className="bg-transparent text-xs px-1">
                  <Share2 className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Shiriki</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} disabled={downloading} className="bg-transparent text-xs px-1">
                  <Download className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Pakua</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrev} className="flex-1 gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  Iliyopita
                </Button>
                <Button variant="outline" size="sm" onClick={handleNext} className="flex-1 gap-1">
                  Inayofuata
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Canvas text wrap helper
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string): string[] {
  ctx.font = font
  const words = text.split(" ")
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}
