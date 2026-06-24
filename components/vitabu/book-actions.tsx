"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, Download, Loader2, Share2 } from "lucide-react"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useToast } from "@/hooks/use-toast"
import { shareContent } from "@/lib/utils/share"
import { downloadFile } from "@/lib/utils/download"
import type { Book } from "@/lib/types"

interface BookActionsProps {
  book: Book
}

export function BookActions({ book }: BookActionsProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const { toast } = useToast()
  const [downloading, setDownloading] = useState(false)
  const booked = isBookmarked("media", book.id)

  const handleBookmark = async () => {
    const wasBookmarked = booked
    const ok = await toggleBookmark("media", book.id)
    if (!ok) return
    toast(
      wasBookmarked
        ? { title: "Alama imeondolewa" }
        : { title: "Imehifadhiwa", description: "Kitabu kimehifadhiwa" },
    )
  }

  const handleShare = async () => {
    await shareContent(book.title, `${book.title} na ${book.author}\n\n${book.description}`)
  }

  const handleDownload = async () => {
    if (!book.fileUrl) return
    setDownloading(true)
    try {
      await downloadFile(book.fileUrl, book.title)
    } catch (error) {
      toast({
        title: "Imeshindikana kupakua",
        description: error instanceof Error ? error.message : "Tafadhali jaribu tena baadaye.",
        variant: "destructive",
      })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <Button size="sm" onClick={handleBookmark} variant={booked ? "secondary" : "default"}>
        {booked ? <BookmarkCheck className="h-4 w-4 sm:mr-1.5" /> : <Bookmark className="h-4 w-4 sm:mr-1.5" />}
        <span className="hidden sm:inline">{booked ? "Imehifadhiwa" : "Hifadhi"}</span>
      </Button>
      <Button size="sm" variant="outline" onClick={handleShare}>
        <Share2 className="h-4 w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">Shiriki</span>
      </Button>
      <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloading || !book.fileUrl}>
        {downloading ? (
          <Loader2 className="h-4 w-4 sm:mr-1.5 animate-spin" />
        ) : (
          <Download className="h-4 w-4 sm:mr-1.5" />
        )}
        <span className="hidden sm:inline">Pakua</span>
      </Button>
    </div>
  )
}
