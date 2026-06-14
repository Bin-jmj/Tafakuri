"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Calendar,
  Clock,
  Copy,
  Download,
  Share2,
  User,
} from "lucide-react"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useReadingProgress } from "@/hooks/use-reading-progress"
import { useToast } from "@/hooks/use-toast"
import { copyToClipboard, shareContent } from "@/lib/utils/share"
import type { Article, Book } from "@/lib/types"

interface ArticleNavItem {
  id: string
  title: string
}

interface ArticleDetailProps {
  article: Article
  prevArticle: ArticleNavItem | null
  nextArticle: ArticleNavItem | null
  recommendedBooks: Book[]
}

const WORDS_PER_MINUTE = 200

export function ArticleDetail({ article, prevArticle, nextArticle, recommendedBooks }: ArticleDetailProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const { progress: savedProgress, loaded: progressLoaded, signedIn, saveProgress } = useReadingProgress("article", article.id)
  const { toast } = useToast()
  const [progress, setProgress] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const articleRef = useRef<HTMLDivElement>(null)
  const restoredRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const bookmarked = isBookmarked("article", article.id)
  const wordCount = article.content.trim().split(/\s+/).filter(Boolean).length
  const readingMinutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE))

  // Restore the saved scroll position once on load
  useEffect(() => {
    if (!progressLoaded || restoredRef.current) return
    restoredRef.current = true
    const el = articleRef.current
    if (savedProgress && savedProgress.progressPercent > 0 && savedProgress.progressPercent < 100 && el) {
      const total = el.getBoundingClientRect().height - window.innerHeight
      if (total > 0) {
        window.scrollTo({ top: (savedProgress.progressPercent / 100) * total + el.getBoundingClientRect().top + window.scrollY })
      }
    }
  }, [progressLoaded, savedProgress])

  useEffect(() => {
    const handleScroll = () => {
      const el = articleRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const pct = total <= 0 ? 100 : Math.min(100, Math.max(0, (-rect.top / total) * 100))
      setProgress(pct)

      if (!signedIn) return
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        saveProgress({ progressPercent: Math.round(pct) })
      }, 1500)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [signedIn, saveProgress])

  const handleBookmark = async () => {
    const wasBookmarked = bookmarked
    const ok = await toggleBookmark("article", article.id)
    if (!ok) return
    toast(
      wasBookmarked
        ? { title: "Alama imeondolewa", description: "Makala imeondolewa kwenye alama zako" }
        : { title: "Imehifadhiwa", description: "Makala imehifadhiwa kwenye alama zako" },
    )
  }

  const handleCopy = async () => {
    const text = `${article.title}\n\n${article.content}\n\nMwandishi: ${article.author}\nKategoria: ${article.category}`
    const ok = await copyToClipboard(text)
    toast({ title: ok ? "Imenakiliwa" : "Kunakili kumeshindikana", variant: ok ? "default" : "destructive" })
  }

  const handleShare = async () => {
    const shared = await shareContent(article.title, `${article.title}\n\n${article.content.substring(0, 200)}...`)
    if (!shared) toast({ title: "Kushiriki hakuwezekani", description: "Nakili maandishi badala yake" })
  }

  const handleDownloadPdf = async () => {
    setDownloading(true)
    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF({ unit: "pt", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 50
      const footerHeight = 40
      let y = margin

      // Header with logo + brand
      try {
        const logoData = await loadImageAsDataUrl("/logo.png")
        doc.addImage(logoData, "PNG", margin, y, 40, 40)
      } catch {
        // logo optional
      }
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.text("Tafakuri", margin + 50, y + 25)
      y += 60

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(120)
      doc.text(article.category.toUpperCase(), margin, y)
      y += 22

      doc.setTextColor(20)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(20)
      const titleLines = doc.splitTextToSize(article.title, pageWidth - margin * 2)
      for (const line of titleLines) {
        doc.text(line, margin, y)
        y += 26
      }
      y += 4

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.setTextColor(120)
      const dateLabel = new Date(article.publishedDate).toLocaleDateString("sw-TZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      doc.text(`${article.author}  •  ${dateLabel}`, margin, y)
      y += 24

      doc.setDrawColor(220)
      doc.line(margin, y, pageWidth - margin, y)
      y += 24

      doc.setTextColor(30)
      doc.setFontSize(12)
      const contentLines = doc.splitTextToSize(article.content, pageWidth - margin * 2)
      for (const line of contentLines) {
        if (y > pageHeight - footerHeight - margin) {
          doc.addPage()
          y = margin
        }
        doc.text(line, margin, y)
        y += 18
      }

      // Footer on every page
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setDrawColor(220)
        doc.line(margin, pageHeight - footerHeight + 5, pageWidth - margin, pageHeight - footerHeight + 5)
        doc.setFontSize(9)
        doc.setTextColor(140)
        doc.text("Tafakuri — Maarifa ya Kiislamu kwa Kiswahili", margin, pageHeight - footerHeight + 22)
        doc.text(`Uk. ${i} / ${pageCount}`, pageWidth - margin, pageHeight - footerHeight + 22, { align: "right" })
      }

      doc.save(`${article.title.slice(0, 60).replace(/[^\w\s-]/g, "").trim() || "makala"}.pdf`)
      toast({ title: "Imepakuliwa", description: "Makala imepakuliwa kama PDF" })
    } catch {
      toast({ title: "Imeshindikana kupakua", variant: "destructive" })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <Link href="/articles">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Rudi kwenye Makala
          </Button>
        </Link>

        <article ref={articleRef}>
          {article.imageUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-6 bg-muted">
              <img
                src={article.imageUrl || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <Badge variant="secondary" className="w-fit mb-4">
                  {article.category}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBookmark}
                  aria-label={bookmarked ? "Ondoa alama" : "Weka alama"}
                  className="-mt-1 flex-shrink-0"
                >
                  {bookmarked ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
                </Button>
              </div>
              <CardTitle className="text-4xl mb-4 text-balance">{article.title}</CardTitle>
              <CardDescription className="flex items-center gap-4 text-base flex-wrap">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(article.publishedDate).toLocaleDateString("sw-TZ", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Dakika {readingMinutes} za kusoma</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-line">{article.content}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t flex-wrap">
                <Button variant="outline" size="sm" onClick={handleCopy} className="bg-transparent">
                  <Copy className="mr-2 h-4 w-4" />
                  Nakili
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} className="bg-transparent">
                  <Share2 className="mr-2 h-4 w-4" />
                  Shiriki
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={downloading} className="bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  {downloading ? "Inapakua..." : "Pakua PDF"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </article>

        {/* Prev / Next navigation */}
        {(prevArticle || nextArticle) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {prevArticle ? (
              <Link href={`/articles/${prevArticle.id}`}>
                <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center gap-3">
                    <ArrowLeft className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">Makala Iliyotangulia</p>
                      <p className="text-sm font-medium line-clamp-1">{prevArticle.title}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <div />
            )}
            {nextArticle && (
              <Link href={`/articles/${nextArticle.id}`}>
                <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center justify-end gap-3 text-right">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">Makala Inayofuata</p>
                      <p className="text-sm font-medium line-clamp-1">{nextArticle.title}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        )}

        {/* Recommended books */}
        {recommendedBooks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Vitabu Vinavyopendekezwa
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {recommendedBooks.map((book) => (
                <Link key={book.id} href={`/vitabu/${book.id}`}>
                  <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all">
                    <CardContent className="p-4 flex gap-3">
                      <div className="w-14 h-20 rounded bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="h-6 w-6 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold line-clamp-2">{book.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
                        <Badge variant="outline" className="text-xs mt-2">{book.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function loadImageAsDataUrl(src: string): Promise<string> {
  return fetch(src)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }),
    )
}
