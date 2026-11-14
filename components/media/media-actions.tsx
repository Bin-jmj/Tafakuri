"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, Download, Loader2, Share2 } from "lucide-react"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useToast } from "@/hooks/use-toast"
import { shareContent } from "@/lib/utils/share"
import { downloadFile } from "@/lib/utils/download"

interface MediaActionsProps {
  id: string
  title: string
  author: string
  description: string
  fileUrl?: string
  savedDescription: string
}

/** Bookmark/Share/Download actions shared by the book, audio, and video detail pages. */
export function MediaActions({ id, title, author, description, fileUrl, savedDescription }: MediaActionsProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const { toast } = useToast()
  const [downloading, setDownloading] = useState(false)
  const booked = isBookmarked("media", id)

  const handleBookmark = async () => {
    const wasBookmarked = booked
    const ok = await toggleBookmark("media", id)
    if (!ok) return
    toast(
      wasBookmarked
        ? { title: "Alama imeondolewa" }
        : { title: "Imehifadhiwa", description: savedDescription },
    )
  }

  const handleShare = async () => {
    await shareContent(title, `${title} na ${author}\n\n${description}`)
  }

  const handleDownload = async () => {
    if (!fileUrl) return
    setDownloading(true)
    try {
      await downloadFile(fileUrl, title)
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
      <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloading || !fileUrl}>
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
