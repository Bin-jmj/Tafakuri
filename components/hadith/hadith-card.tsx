"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, Share2, Copy } from "lucide-react"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useToast } from "@/hooks/use-toast"
import { shareContent, copyToClipboard } from "@/lib/utils/share"
import type { Hadith } from "@/lib/types"

interface HadithCardProps {
  hadith: Hadith
}

export function HadithCard({ hadith }: HadithCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const { toast } = useToast()

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
    const shared = await shareContent("Hadith", text)
    if (!shared) {
      toast({ title: "Kushiriki hakuwezekani", description: "Nakili maandishi badala yake" })
    }
  }

  const handleCopy = async () => {
    const text = `${hadith.arabicText}\n\n${hadith.swahiliTranslation}\n\nMsimuliaji: ${hadith.narrator}\nChanzo: ${hadith.source}`
    const copied = await copyToClipboard(text)
    toast(
      copied
        ? { title: "Imenakiliwa", description: "Hadith imenakiliwa kwenye clipboard" }
        : { title: "Kunakili kumeshindikana", description: "Tafadhali jaribu tena", variant: "destructive" },
    )
  }

  return (
    <Card className="overflow-hidden border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-2 mb-4">
          <Badge variant="secondary">{hadith.category}</Badge>
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

        <div className="space-y-4">
          <p className="arabic-text text-foreground leading-loose">{hadith.arabicText}</p>
          <p className="text-base leading-relaxed text-foreground">{hadith.swahiliTranslation}</p>
        </div>

        <div className="mt-5 pt-5 border-t space-y-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Msimuliaji:</span> {hadith.narrator}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Chanzo:</span> {hadith.source}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 bg-transparent">
            <Copy className="mr-2 h-4 w-4" />
            Nakili
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="flex-1 bg-transparent">
            <Share2 className="mr-2 h-4 w-4" />
            Shiriki
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
