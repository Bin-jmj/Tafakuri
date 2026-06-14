"use client"

import { useCallback, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, Share2, Copy, Download } from "lucide-react"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useToast } from "@/hooks/use-toast"
import { shareContent, copyToClipboard } from "@/lib/utils/share"
import { drawShareImage, downloadCanvasAsImage } from "@/lib/utils/share-image"
import type { Hadith } from "@/lib/types"

interface DailyHadithCardProps {
  hadith: Hadith
}

export function DailyHadithCard({ hadith }: DailyHadithCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const { toast } = useToast()
  const [downloading, setDownloading] = useState(false)

  const bookmarked = isBookmarked("hadith", hadith.id)

  const handleBookmark = async () => {
    const wasBookmarked = bookmarked
    const ok = await toggleBookmark("hadith", hadith.id)
    if (!ok) return
    toast(
      wasBookmarked
        ? { title: "Alama imeondolewa", description: "Hadith imeondolewa kwenye alama zako" }
        : { title: "Alama imewekwa", description: "Hadith imehifadhiwa kwenye alama zako" },
    )
  }

  const handleShare = async () => {
    const text = `${hadith.arabicText}\n\n${hadith.swahiliTranslation}\n\nMsimuliaji: ${hadith.narrator}\nChanzo: ${hadith.source}`
    await shareContent("Hadith ya Leo", text)
  }

  const handleCopy = async () => {
    const text = `${hadith.arabicText}\n\n${hadith.swahiliTranslation}\n\nMsimuliaji: ${hadith.narrator}\nChanzo: ${hadith.source}`
    const copied = await copyToClipboard(text)
    if (copied) {
      toast({
        title: "Imenakiliwa",
        description: "Hadith imenakiliwa kwenye clipboard",
      })
    } else {
      toast({
        title: "Kunakili kumeshindikana",
        description: "Tafadhali jaribu tena",
        variant: "destructive",
      })
    }
  }

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    try {
      const canvas = drawShareImage({
        title: "Hadith ya Leo",
        meta: hadith.category,
        arabicText: hadith.arabicText,
        translation: hadith.swahiliTranslation,
        source: `${hadith.narrator} — ${hadith.source}`,
        theme: "teal",
      })
      downloadCanvasAsImage(canvas, "hadith")
      toast({ title: "Imepakuliwa", description: "Hadith imepakuliwa kama picha" })
    } catch {
      toast({ title: "Imeshindikana kupakua", variant: "destructive" })
    } finally {
      setDownloading(false)
    }
  }, [hadith, toast])

  return (
    <Card className="h-full overflow-hidden border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">Hadith ya Leo</CardTitle>
            <CardDescription className="text-base">
              {new Date().toLocaleDateString("sw-TZ", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </div>
          <Badge variant="secondary">{hadith.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="flex flex-1 flex-col space-y-6">
          <div className="space-y-4">
            <p className="arabic-text text-foreground leading-loose">{hadith.arabicText}</p>
            <p className="text-lg leading-relaxed text-foreground">{hadith.swahiliTranslation}</p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Msimuliaji:</span> {hadith.narrator}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Chanzo:</span> {hadith.source}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-auto">
            <Button variant="outline" size="sm" onClick={handleBookmark} className="bg-transparent">
              {bookmarked ? <BookmarkCheck className="mr-1.5 h-4 w-4" /> : <Bookmark className="mr-1.5 h-4 w-4" />}
              {bookmarked ? "Imehifadhiwa" : "Hifadhi"}
            </Button>
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
        </div>
      </CardContent>
    </Card>
  )
}
