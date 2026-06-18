"use client"

import { useCallback, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, Copy, Image as ImageIcon, Share2 } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useToast } from "@/hooks/use-toast"
import { copyToClipboard, shareContent } from "@/lib/utils/share"
import { drawShareImage, downloadCanvasAsImage } from "@/lib/utils/share-image"
import type { Adhkar } from "@/lib/types"

interface AdhkarCardProps {
  adhkar: Adhkar
}

export function AdhkarCard({ adhkar }: AdhkarCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const { toast } = useToast()
  const [downloading, setDownloading] = useState(false)

  const bookmarked = isBookmarked("adhkar", adhkar.id)

  const handleBookmark = async () => {
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
    const text = `${adhkar.arabicText}\n\n${adhkar.swahiliTranslation}\n\n(${adhkar.transliteration})\n\nMara: ${adhkar.count} | Chanzo: ${adhkar.reference}`
    const ok = await copyToClipboard(text)
    toast({ title: ok ? "Imenakiliwa" : "Kunakili kumeshindikana", variant: ok ? "default" : "destructive" })
  }

  const handleShare = async () => {
    const text = `${adhkar.arabicText}\n\n${adhkar.swahiliTranslation}\n\nChanzo: ${adhkar.reference}`
    const shared = await shareContent("Adhkar", text)
    if (!shared) toast({ title: "Kushiriki hakuwezekani", description: "Nakili maandishi badala yake" })
  }

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    try {
      const canvas = drawShareImage({
        title: "Adhkar",
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
  }, [adhkar, toast])

  return (
    <Card className="overflow-hidden border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmark}
            className="h-9 w-9"
            aria-label={bookmarked ? "Ondoa alama" : "Weka alama"}
          >
            {bookmarked ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
          </Button>
        </div>

        <div className="space-y-4 text-center">
          <p className="arabic-text text-foreground leading-loose text-2xl" style={{ direction: "rtl" }}>
            {adhkar.arabicText}
          </p>
          <p className="text-sm text-muted-foreground italic">{adhkar.transliteration}</p>
          <p className="text-base leading-relaxed text-foreground text-left">{adhkar.swahiliTranslation}</p>
        </div>

        <div className="mt-5 pt-5 border-t flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span><span className="font-medium text-foreground">Mara:</span> {adhkar.count}x</span>
          <span>•</span>
          <span><span className="font-medium text-foreground">Chanzo:</span> {adhkar.reference}</span>
        </div>

        {adhkar.benefit && (
          <div className="mt-3 bg-muted border border-border rounded-lg p-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-primary">Faida: </span>
              {adhkar.benefit}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 mt-5">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={downloading} className="flex-1 bg-transparent">
                <Copy className="mr-2 h-4 w-4" />
                Nakili
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
          <Button variant="outline" size="sm" onClick={handleShare} className="flex-1 bg-transparent">
            <Share2 className="mr-2 h-4 w-4" />
            Shiriki
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
