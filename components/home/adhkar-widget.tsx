"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bookmark, BookmarkCheck, Copy, Image as ImageIcon, Share2, Sparkles, Sun, Moon, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { createClient } from "@/lib/supabase/client"
import { mapAdhkar } from "@/lib/mappers"
import type { Adhkar } from "@/lib/types"
import { copyToClipboard, shareContent } from "@/lib/utils/share"
import { DEFAULT_ROTATION_SETTINGS, getAdhkarRotateSeconds, getAdhkarSlot, type RotationSettings } from "@/lib/utils/rotation"
import { getActiveOccasionItemIds } from "@/lib/utils/occasions"
import { downloadCanvasAsImage, drawShareImage } from "@/lib/utils/share-image"

interface AdhkarWidgetProps {
  rotationSettings?: RotationSettings
}

export function AdhkarWidget({ rotationSettings = DEFAULT_ROTATION_SETTINGS }: AdhkarWidgetProps) {
  const { toast } = useToast()
  const { isBookmarked, toggleBookmark } = useBookmarks()

  const [slot, setSlot] = useState<"asubuhi" | "jioni">(() => getAdhkarSlot(rotationSettings))
  const rotateMs = getAdhkarRotateSeconds(rotationSettings, slot) * 1000
  const [adhkarList, setAdhkarList] = useState<Adhkar[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const [occasionName, setOccasionName] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Load adhkar — an active occasion's pool (e.g. Ramadhani) takes priority
  // over the normal asubuhi/jioni slot rotation, falling back automatically
  // whenever no occasion is configured or active.
  useEffect(() => {
    let active = true
    const supabase = createClient()

    async function load() {
      const occasion = await getActiveOccasionItemIds(supabase, "adhkar")
      if (!active) return

      if (occasion) {
        const { data } = await supabase.from("adhkar").select("*").in("id", occasion.itemIds)
        if (!active) return
        const byId = new Map((data ?? []).map((row) => [row.id, row]))
        const ordered = occasion.itemIds.map((id) => byId.get(id)).filter((row): row is NonNullable<typeof row> => !!row)
        setAdhkarList(ordered.map(mapAdhkar))
        setCurrentIndex(0)
        setOccasionName(occasion.occasionName)
        return
      }

      setOccasionName(null)
      const { data } = await supabase
        .from("adhkar")
        .select("*")
        .eq("slot", slot)
        .order("sort_order", { ascending: true })
      if (!active) return
      setAdhkarList((data ?? []).map(mapAdhkar))
      setCurrentIndex(0)
    }

    load()
    return () => {
      active = false
    }
  }, [slot])

  // Auto-rotate. The per-second countdown lives in its own child component
  // (RotationCountdown below) so this interval — and this re-render — only
  // fires once per full rotation, not once per second. Re-rendering the
  // whole card (icons, Dialog, etc.) every second was visibly heavy on
  // low-end devices, showing up as repaint/ghosting artifacts on the
  // bottom icon row.
  useEffect(() => {
    if (!adhkarList.length) return
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % adhkarList.length)
    }, rotateMs)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [adhkarList, rotateMs])

  const adhkar = adhkarList[currentIndex]

  const handlePrev = () => {
    setCurrentIndex((i) => (i - 1 + adhkarList.length) % adhkarList.length)
  }
  const handleNext = () => {
    setCurrentIndex((i) => (i + 1) % adhkarList.length)
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
    const title = occasionName ? `Adhkar za ${occasionName}` : `Adhkar za ${slot === "asubuhi" ? "Asubuhi" : "Jioni"}`
    const text = `${adhkar.arabicText}\n\n${adhkar.swahiliTranslation}\n\nChanzo: ${adhkar.reference}`
    const shared = await shareContent(title, text)
    if (!shared) toast({ title: "Kushiriki hakuwezekani", description: "Nakili maandishi badala yake" })
  }

  const handleDownload = useCallback(async () => {
    if (!adhkar) return
    setDownloading(true)
    try {
      const title = occasionName ? `Adhkar za ${occasionName}` : `Adhkar za ${slot === "asubuhi" ? "Asubuhi" : "Jioni"}`
      const canvas = drawShareImage({
        title,
        meta: `Mara: ${adhkar.count}x`,
        arabicText: adhkar.arabicText,
        translation: adhkar.swahiliTranslation,
        noteLabel: "Faida",
        note: adhkar.benefit,
        source: adhkar.reference,
      })
      downloadCanvasAsImage(canvas, "adhkar")
      toast({ title: "Imepakuliwa", description: "Adhkar imepakuliwa kama picha" })
    } catch {
      toast({ title: "Imeshindikana kupakua", variant: "destructive" })
    } finally {
      setDownloading(false)
    }
  }, [adhkar, slot, occasionName, toast])

  if (!adhkar) return null

  return (
    <Card className="overflow-hidden border-primary/20 shadow-lg" ref={cardRef}>
      <CardHeader className="pb-3 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {occasionName ? (
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
            ) : slot === "asubuhi" ? (
              <Sun className="h-5 w-5 text-amber-500 flex-shrink-0" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-400 flex-shrink-0" />
            )}
            <span className="font-bold text-lg truncate">
              {occasionName ? `Adhkar za ${occasionName}` : `Adhkar za ${slot === "asubuhi" ? "Asubuhi" : "Jioni"}`}
            </span>
          </div>
          <Badge variant="outline" className="text-xs flex-shrink-0">
            {currentIndex + 1} / {adhkarList.length}
          </Badge>
        </div>
        {!occasionName && (
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
            <Link href={`/adhkar/${slot === "asubuhi" ? "Asubuhi" : "Jioni"}`} className="ml-auto">
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Tazama Zote
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        )}
        {/* 10-min rotation progress */}
        <RotationCountdown
          rotateMs={rotateMs}
          resetKey={`${slot}-${currentIndex}`}
          label={`Inabadilika kila sekunde ${rotateMs / 1000}`}
        />
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

            <div className="bg-muted border border-border rounded-lg p-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-primary">Faida: </span>
                {adhkar.benefit}
              </p>
            </div>

            {/* Navigation + Actions */}
            <div className="flex flex-col gap-2 mt-auto">
              <div className="grid grid-cols-3 gap-1.5">
                <Button variant="outline" size="sm" onClick={handleBookmark} className="bg-transparent text-xs px-1">
                  {bookmarked ? <BookmarkCheck className="h-3.5 w-3.5 sm:mr-1 text-primary" /> : <Bookmark className="h-3.5 w-3.5 sm:mr-1" />}
                  <span className="hidden sm:inline">Hifadhi</span>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={downloading} className="bg-transparent text-xs px-1">
                      <Copy className="h-3.5 w-3.5 sm:mr-1" />
                      <span className="hidden sm:inline">Nakili</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                      <DialogTitle>Nakili</DialogTitle>
                      <DialogDescription>Chagua unavyotaka kuhifadhi au kushiriki adhkar hii.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2">
                      <DialogClose asChild>
                        <Button variant="outline" onClick={handleDownload} disabled={downloading}>
                          <ImageIcon className="mr-1.5 h-4 w-4" />
                          Pakua
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button variant="outline" onClick={handleCopy}>
                          <Copy className="mr-1.5 h-4 w-4" />
                          Nakili
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={handleShare} className="bg-transparent text-xs px-1">
                  <Share2 className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Shiriki</span>
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

// Isolated so the once-per-second tick only re-renders this small block —
// not the whole card (icons, Dialog, etc.), which was causing repaint
// artifacts on low-end devices.
function RotationCountdown({ rotateMs, resetKey, label }: { rotateMs: number; resetKey: string; label: string }) {
  const [timeLeft, setTimeLeft] = useState(rotateMs)

  useEffect(() => {
    setTimeLeft(rotateMs)
    const tick = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1000))
    }, 1000)
    return () => clearInterval(tick)
  }, [resetKey, rotateMs])

  const progressPct = Math.round(((rotateMs - timeLeft) / rotateMs) * 100)
  const minutesLeft = Math.floor(timeLeft / 60000)
  const secondsLeft = Math.floor((timeLeft % 60000) / 1000)

  return (
    <div className="mt-3 space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{minutesLeft}:{String(secondsLeft).padStart(2, "0")} iliyobaki</span>
      </div>
      <Progress value={progressPct} className="h-1.5" />
    </div>
  )
}
