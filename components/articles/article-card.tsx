"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, Calendar, User, Share2, Copy, Newspaper } from "lucide-react"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useToast } from "@/hooks/use-toast"
import { shareContent, copyToClipboard } from "@/lib/utils/share"
import type { Article } from "@/lib/types"
import Link from "next/link"

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const { toast } = useToast()

  const bookmarked = isBookmarked("article", article.id)

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    const wasBookmarked = bookmarked
    const ok = await toggleBookmark("article", article.id)
    if (!ok) return
    toast(
      wasBookmarked
        ? { title: "Alama imeondolewa", description: "Makala imeondolewa kwenye alama zako" }
        : { title: "Alama imewekwa", description: "Makala imehifadhiwa kwenye alama zako" },
    )
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    const text = `${article.title}\n\n${article.content.substring(0, 200)}...\n\nMwandishi: ${article.author}`
    const shared = await shareContent(article.title, text)
    if (!shared) {
      toast({
        title: "Kushiriki hakuwezekani",
        description: "Kifaa chako hakitumii kipengele cha kushiriki",
      })
    }
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    const text = `${article.title}\n\n${article.content}\n\nMwandishi: ${article.author}\nKategoria: ${article.category}`
    const copied = await copyToClipboard(text)
    if (copied) {
      toast({
        title: "Imenakiliwa",
        description: "Makala imenakiliwa kwenye clipboard",
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
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-primary h-full flex flex-col">
      <Link href={`/articles/${article.id}`}>
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {article.imageUrl ? (
            <img
              src={article.imageUrl || "/placeholder.svg"}
              alt={article.title}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Newspaper className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
        </div>
      </Link>
      <CardHeader className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="secondary">{article.category}</Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmark}
            className="shrink-0 -mt-1"
            aria-label={bookmarked ? "Ondoa alama" : "Weka alama"}
          >
            {bookmarked ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
          </Button>
        </div>
        <Link href={`/articles/${article.id}`}>
          <CardTitle className="text-xl leading-tight text-balance hover:text-primary transition-colors cursor-pointer">
            {article.title}
          </CardTitle>
        </Link>
        <CardDescription className="line-clamp-2 text-pretty">{article.content}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(article.publishedDate).toLocaleDateString("sw-TZ", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
