"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bookmark, BookmarkCheck, BookOpen, Download, Search, Share2 } from "lucide-react"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useToast } from "@/hooks/use-toast"
import { shareContent } from "@/lib/utils/share"
import type { Book } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"

const CATEGORIES = ["Zote", "Hadith", "Fiqh", "Tafsiri", "Akida", "Siira"]

interface VitabuGridProps {
  books: Book[]
}

export function VitabuGrid({ books }: VitabuGridProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Zote")
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const { toast } = useToast()

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === "Zote" || b.category === category
      return matchSearch && matchCat
    })
  }, [books, search, category])

  const handleBookmark = async (bookId: string) => {
    const wasBookmarked = isBookmarked("media", bookId)
    const ok = await toggleBookmark("media", bookId)
    if (!ok) return
    toast(wasBookmarked ? { title: "Alama imeondolewa" } : { title: "Imehifadhiwa", description: "Kitabu kimehifadhiwa kwenye alama zako" })
  }

  const handleShare = async (book: Book) => {
    await shareContent(book.title, `${book.title} na ${book.author}\n\n${book.description}`)
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tafuta kitabu au mwandishi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Chagua aina" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Vitabu {filtered.length} vinapatikana
      </p>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((book) => {
          const booked = isBookmarked("media", book.id)
          return (
            <Card key={book.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow border-border/60">
              {/* Cover */}
              <div className="relative h-48 bg-muted overflow-hidden">
                {book.coverUrl ? (
                  <Image
                    src={book.coverUrl}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">{book.category}</Badge>
                </div>
              </div>

              <CardContent className="flex-1 p-4 space-y-2">
                <h3 className="font-bold text-base leading-tight line-clamp-2">{book.title}</h3>
                <p className="text-sm text-muted-foreground">{book.author}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{book.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                  {book.totalPages && <span>{book.totalPages} kurasa</span>}
                  {book.publishedYear && <span>•</span>}
                  {book.publishedYear && <span>{book.publishedYear}</span>}
                  <span>•</span>
                  <span>{book.downloadCount.toLocaleString()} pakuzi</span>
                </div>
              </CardContent>

              <CardFooter className="p-3 pt-0 flex gap-2">
                <Link href={`/vitabu/${book.id}`} className="flex-1">
                  <Button size="sm" className="w-full gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    Soma
                  </Button>
                </Link>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleBookmark(book.id)}>
                  {booked ? <BookmarkCheck className="h-3.5 w-3.5 text-primary" /> : <Bookmark className="h-3.5 w-3.5" />}
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleShare(book)}>
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                  <a href={book.fileUrl ?? "#"} download title="Pakua kitabu">
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Hakuna vitabu vilivyopatikana</p>
          <p className="text-sm mt-1">Jaribu kutafuta kwa maneno mengine</p>
        </div>
      )}
    </>
  )
}
