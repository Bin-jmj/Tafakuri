"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, Share2, Copy } from "lucide-react"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useToast } from "@/hooks/use-toast"
import { shareContent, copyToClipboard } from "@/lib/utils/share"
import type { Dua } from "@/lib/types"

interface DuaCardProps {
  dua: Dua
  showCategory?: boolean
}

export function DuaCard({ dua, showCategory = true }: DuaCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const { toast } = useToast()

  const bookmarked = isBookmarked("dua", dua.id)

  const handleBookmark = async () => {
    const wasBookmarked = bookmarked
    const ok = await toggleBookmark("dua", dua.id)
    if (!ok) return
    toast(
      wasBookmarked
        ? { title: "Alama imeondolewa", description: "Dua imeondolewa kwenye alama zako" }
        : { title: "Alama imewekwa", description: "Dua imehifadhiwa kwenye alama zako" },
    )
  }

  const handleShare = async () => {
    const text = `${dua.arabicText}\n\n${dua.swahiliTranslation}\n\n${dua.transliteration ? `(${dua.transliteration})\n\n` : ""}Tukio: ${dua.occasion}${dua.reference ? `\nChanzo: ${dua.reference}` : ""}`

    const shared = await shareContent("Dua", text)
    if (!shared) {
      toast({
        title: "Kushiriki hakuwezekani",
        description: "Kifaa chako hakitumii kipengele cha kushiriki",
      })
    }
  }

  const handleCopy = async () => {
    const text = `${dua.arabicText}\n\n${dua.swahiliTranslation}\n\n${dua.transliteration ? `(${dua.transliteration})\n\n` : ""}Tukio: ${dua.occasion}${dua.reference ? `\nChanzo: ${dua.reference}` : ""}`

    const copied = await copyToClipboard(text)
    if (copied) {
      toast({
        title: "Imenakiliwa",
        description: "Dua imenakiliwa kwenye clipboard",
      })
    } else {
      toast({
        title: "Kunakili kumeshindikana",
        description: "Tafadhali jaribu tena",
        variant: "destructive",
      })
    }
  }

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

        <div className="space-y-5">
          <p className="arabic-text text-foreground leading-loose text-2xl text-right">{dua.arabicText}</p>

          {dua.transliteration && (
            <p className="text-sm italic text-muted-foreground bg-muted/30 p-3 rounded-lg">{dua.transliteration}</p>
          )}

          <p className="text-base leading-relaxed text-foreground">{dua.swahiliTranslation}</p>
        </div>

        <div className="mt-5 pt-5 border-t space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-muted-foreground min-w-[60px]">Tukio:</span>
            <span className="text-sm text-foreground">{dua.occasion}</span>
          </div>
          {dua.reference && (
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-muted-foreground min-w-[60px]">Chanzo:</span>
              <span className="text-sm text-foreground">{dua.reference}</span>
            </div>
          )}
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
