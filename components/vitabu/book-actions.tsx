"use client"

import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, Download, Share2 } from "lucide-react"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useToast } from "@/hooks/use-toast"
import { shareContent } from "@/lib/utils/share"
import type { Book } from "@/lib/types"

interface BookActionsProps {
  book: Book
}

export function BookActions({ book }: BookActionsProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const { toast } = useToast()
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

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={handleBookmark} variant={booked ? "secondary" : "default"}>
        {booked ? <BookmarkCheck className="h-4 w-4 mr-1.5" /> : <Bookmark className="h-4 w-4 mr-1.5" />}
        {booked ? "Imehifadhiwa" : "Hifadhi"}
      </Button>
      <Button size="sm" variant="outline" onClick={handleShare}>
        <Share2 className="h-4 w-4 mr-1.5" />
        Shiriki
      </Button>
      <Button size="sm" variant="outline" asChild>
        <a href={book.fileUrl ?? "#"} download>
          <Download className="h-4 w-4 mr-1.5" />
          Pakua
        </a>
      </Button>
    </div>
  )
}
