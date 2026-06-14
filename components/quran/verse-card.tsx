"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Share2, Copy } from "lucide-react"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useToast } from "@/hooks/use-toast"
import { shareContent, copyToClipboard } from "@/lib/utils/share"
import type { QuranVerse } from "@/lib/types"

interface VerseCardProps {
  verse: QuranVerse
}

export function VerseCard({ verse }: VerseCardProps) {
  const [showTafsir, setShowTafsir] = useState(false)
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const { toast } = useToast()

  const bookmarked = isBookmarked("quran_verse", verse.id)

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
    const text = `${verse.arabicText}\n\n${verse.swahiliTranslation}\n\nAya ${verse.verseNumber}`
    const shared = await shareContent("Aya ya Qurani", text)
    if (!shared) {
      toast({
        title: "Kushiriki hakuwezekani",
        description: "Kifaa chako hakitumii kipengele cha kushiriki",
      })
    }
  }

  const handleCopy = async () => {
    const text = `${verse.arabicText}\n\n${verse.swahiliTranslation}\n\nAya ${verse.verseNumber}`
    const copied = await copyToClipboard(text)
    if (copied) {
      toast({
        title: "Imenakiliwa",
        description: "Aya imenakiliwa kwenye clipboard",
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
    <Card id={`aya-${verse.verseNumber}`} className="overflow-hidden scroll-mt-24">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <Badge variant="secondary" className="shrink-0">
            {verse.verseNumber}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmark}
            className="shrink-0"
            aria-label={bookmarked ? "Ondoa alama" : "Weka alama"}
          >
            {bookmarked ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
          </Button>
        </div>

        <div className="space-y-4">
          <p className="arabic-text text-foreground leading-loose">{verse.arabicText}</p>

          <p className="text-base leading-relaxed text-foreground">{verse.swahiliTranslation}</p>

          {verse.tafsir && (
            <Collapsible open={showTafsir} onOpenChange={setShowTafsir}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full bg-transparent" size="sm">
                  {showTafsir ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      Ficha Tafsiri
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Onyesha Tafsiri
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{verse.tafsir}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 bg-transparent">
              <Copy className="mr-2 h-4 w-4" />
              Nakili
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="flex-1 bg-transparent">
              <Share2 className="mr-2 h-4 w-4" />
              Shiriki
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
