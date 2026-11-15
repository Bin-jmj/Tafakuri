"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CategoryBadges } from "@/components/ui/category-badges"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, CloudOff, FileText, HandHeart, Info, Library, Scroll, Sparkles, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useBookmarks, type BookmarkContentType } from "@/hooks/use-bookmarks"
import { createClient } from "@/lib/supabase/client"
import { getDB } from "@/lib/offline/db"
import { mapAdhkar, mapArticle, mapBook, mapDua, mapHadith, mapQuranVerse } from "@/lib/mappers"
import type { Adhkar, Article, Book, Dua, Hadith, QuranVerse } from "@/lib/types"
import Link from "next/link"

interface BookmarkedContent {
  quranVerses: QuranVerse[]
  hadiths: Hadith[]
  duas: Dua[]
  adhkar: Adhkar[]
  articles: Article[]
  books: Book[]
}

const EMPTY: BookmarkedContent = { quranVerses: [], hadiths: [], duas: [], adhkar: [], articles: [], books: [] }

function idsFor(rows: string[], type: BookmarkContentType): string[] {
  return rows
    .filter((r) => r.startsWith(`${type}:`))
    .map((r) => r.slice(type.length + 1))
}

export function BookmarksList() {
  const { toggleBookmark, bookmarks, loaded, signedIn } = useBookmarks()
  const { toast } = useToast()
  const [content, setContent] = useState<BookmarkedContent>(EMPTY)

  const bookmarkedRows = Array.from(bookmarks)

  // Hydrate the bookmarked ids into full content rows. Core content
  // (Qur'an, Hadith, Dua, Adhkar) is read straight from the IndexedDB
  // content bundle so the list works offline; anything the local bundle
  // is missing is topped up from Supabase while online. Articles and
  // books are not part of the offline bundle, so they always come from
  // Supabase (their cards disappear when offline).
  useEffect(() => {
    if (!loaded) return
    let active = true

    async function hydrate() {
      const result: BookmarkedContent = { ...EMPTY }
      const supabase = createClient()

      try {
        const db = await getDB()

        // 1) Locally available core content, straight from the IndexedDB
        //    bundle so the list works offline.
        const missingVerses: string[] = []
        const missingHadiths: string[] = []
        const missingDuas: string[] = []
        const missingAdhkar: string[] = []

        for (const id of idsFor(bookmarkedRows, "quran_verse")) {
          const row = await db.get("quran", id)
          if (row) result.quranVerses.push(row)
          else missingVerses.push(id)
        }
        for (const id of idsFor(bookmarkedRows, "hadith")) {
          const row = await db.get("hadith", id)
          if (row) result.hadiths.push(row)
          else missingHadiths.push(id)
        }
        for (const id of idsFor(bookmarkedRows, "dua")) {
          const row = await db.get("dua", id)
          if (row) result.duas.push(row)
          else missingDuas.push(id)
        }
        for (const id of idsFor(bookmarkedRows, "adhkar")) {
          const row = await db.get("adhkar", id)
          if (row) result.adhkar.push(row)
          else missingAdhkar.push(id)
        }

        // 2) Top up missing core rows + fetch article/book rows from
        //    Supabase (skipped entirely when offline - articles and books
        //    are not part of the offline bundle).
        if (navigator.onLine) {
          const articleIds = idsFor(bookmarkedRows, "article")
          const mediaIds = idsFor(bookmarkedRows, "media")

          const [verseRes, hadithRes, duaRes, adhkarRes, articleRes, bookRes] = await Promise.all([
            missingVerses.length ? supabase.from("quran_verses").select("*").in("id", missingVerses) : Promise.resolve({ data: [] }),
            missingHadiths.length ? supabase.from("hadiths").select("*").in("id", missingHadiths) : Promise.resolve({ data: [] }),
            missingDuas.length ? supabase.from("duas").select("*").in("id", missingDuas) : Promise.resolve({ data: [] }),
            missingAdhkar.length ? supabase.from("adhkar").select("*").in("id", missingAdhkar) : Promise.resolve({ data: [] }),
            articleIds.length ? supabase.from("articles").select("*").in("id", articleIds) : Promise.resolve({ data: [] }),
            mediaIds.length ? supabase.from("media_items").select("*").in("id", mediaIds) : Promise.resolve({ data: [] }),
          ])

          result.quranVerses.push(...(verseRes.data ?? []).map(mapQuranVerse))
          result.hadiths.push(...(hadithRes.data ?? []).map(mapHadith))
          result.duas.push(...(duaRes.data ?? []).map(mapDua))
          result.adhkar.push(...(adhkarRes.data ?? []).map(mapAdhkar))
          result.articles.push(...(articleRes.data ?? []).map(mapArticle))
          result.books.push(...(bookRes.data ?? []).map(mapBook))
        }
      } catch {
        // No IndexedDB (private mode / unsupported) - rely on Supabase only.
        if (!navigator.onLine || !active) return
        const [verseRes, hadithRes, duaRes, adhkarRes, articleRes, bookRes] = await Promise.all([
          supabase.from("quran_verses").select("*").in("id", idsFor(bookmarkedRows, "quran_verse")),
          supabase.from("hadiths").select("*").in("id", idsFor(bookmarkedRows, "hadith")),
          supabase.from("duas").select("*").in("id", idsFor(bookmarkedRows, "dua")),
          supabase.from("adhkar").select("*").in("id", idsFor(bookmarkedRows, "adhkar")),
          supabase.from("articles").select("*").in("id", idsFor(bookmarkedRows, "article")),
          supabase.from("media_items").select("*").in("id", idsFor(bookmarkedRows, "media")),
        ])
        result.quranVerses = (verseRes.data ?? []).map(mapQuranVerse)
        result.hadiths = (hadithRes.data ?? []).map(mapHadith)
        result.duas = (duaRes.data ?? []).map(mapDua)
        result.adhkar = (adhkarRes.data ?? []).map(mapAdhkar)
        result.articles = (articleRes.data ?? []).map(mapArticle)
        result.books = (bookRes.data ?? []).map(mapBook)
      }

      if (active) setContent(result)
    }

    void hydrate()
    return () => {
      active = false
    }
  }, [bookmarkedRows, loaded])

  const handleRemove = async (type: BookmarkContentType, id: string, label: string) => {
    const ok = await toggleBookmark(type, id)
    if (!ok) return
    setContent((prev) => ({
      ...prev,
      quranVerses: type === "quran_verse" ? prev.quranVerses.filter((v) => v.id !== id) : prev.quranVerses,
      hadiths: type === "hadith" ? prev.hadiths.filter((h) => h.id !== id) : prev.hadiths,
      duas: type === "dua" ? prev.duas.filter((d) => d.id !== id) : prev.duas,
      adhkar: type === "adhkar" ? prev.adhkar.filter((a) => a.id !== id) : prev.adhkar,
      articles: type === "article" ? prev.articles.filter((a) => a.id !== id) : prev.articles,
      books: type === "media" ? prev.books.filter((b) => b.id !== id) : prev.books,
    }))
    toast({ title: "Alama imeondolewa", description: `${label} imeondolewa kwenye alama zako` })
  }

  if (!loaded) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />
        <Card>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!signedIn && bookmarkedRows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>Tafadhali ingia kwenye akaunti yako kuona alama zako. Kama huna akaunti, jisajili — ni bure.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Link href="/auth/login">
            <Button>Ingia</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button variant="outline">Jisajili</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const hasAny = bookmarkedRows.length > 0

  return (
    <div className="space-y-4">
      {!signedIn && hasAny && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 p-4">
            <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <div className="text-sm space-y-2">
              <p>
                Alama hizi zimehifadhiwa kwenye kifaa chako na zinafanya kazi hata nje ya mtandao. Zitaunganishwa na akaunti yako mara tu unapoingia.
              </p>
              <Link href="/auth/login">
                <Button size="sm" variant="outline">
                  Ingia kuunganisha
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="quran" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
          <TabsTrigger value="quran" className="min-w-0 gap-1.5">
            <BookOpen className="shrink-0" />
            <span className="hidden truncate sm:inline">Qur&apos;ani</span>
            <span className="min-w-0 truncate tabular-nums">({content.quranVerses.length})</span>
          </TabsTrigger>
          <TabsTrigger value="hadith" className="min-w-0 gap-1.5">
            <Scroll className="shrink-0" />
            <span className="hidden truncate sm:inline">Hadith</span>
            <span className="min-w-0 truncate tabular-nums">({content.hadiths.length})</span>
          </TabsTrigger>
          <TabsTrigger value="dua" className="min-w-0 gap-1.5">
            <HandHeart className="shrink-0" />
            <span className="hidden truncate sm:inline">Dua</span>
            <span className="min-w-0 truncate tabular-nums">({content.duas.length})</span>
          </TabsTrigger>
          <TabsTrigger value="adhkar" className="min-w-0 gap-1.5">
            <Sparkles className="shrink-0" />
            <span className="hidden truncate sm:inline">Adhkar</span>
            <span className="min-w-0 truncate tabular-nums">({content.adhkar.length})</span>
          </TabsTrigger>
          <TabsTrigger value="articles" className="min-w-0 gap-1.5">
            <FileText className="shrink-0" />
            <span className="hidden truncate sm:inline">Makala</span>
            <span className="min-w-0 truncate tabular-nums">({content.articles.length})</span>
          </TabsTrigger>
          <TabsTrigger value="books" className="min-w-0 gap-1.5">
            <Library className="shrink-0" />
            <span className="hidden truncate sm:inline">Vitabu</span>
            <span className="min-w-0 truncate tabular-nums">({content.books.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quran" className="space-y-4 mt-6">
          {content.quranVerses.length === 0 ? (
            <EmptyTab text="Huna alama za Qur'ani bado. Weka alama kwenye aya unazopenda." />
          ) : (
            content.quranVerses.map((verse) => (
              <Card key={verse.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <Badge variant="secondary">
                        {verse.surahNumber}:{verse.verseNumber}
                      </Badge>
                      <p className="text-sm text-muted-foreground line-clamp-2">{verse.swahiliTranslation}</p>
                      <Link href={`/quran/${verse.surahNumber}`}>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Soma zaidi
                        </Button>
                      </Link>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemove("quran_verse", verse.id, "Aya")} aria-label="Ondoa alama">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="hadith" className="space-y-4 mt-6">
          {content.hadiths.length === 0 ? (
            <EmptyTab text="Huna alama za Hadith bado. Weka alama kwenye Hadith unazopenda." />
          ) : (
            content.hadiths.map((hadith) => (
              <Card key={hadith.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <CategoryBadges categories={hadith.categories} />
                      <p className="text-sm text-muted-foreground line-clamp-2">{hadith.swahiliTranslation}</p>
                      <p className="text-xs text-muted-foreground">
                        {hadith.narrator} - {hadith.source}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemove("hadith", hadith.id, "Hadith")} aria-label="Ondoa alama">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="dua" className="space-y-4 mt-6">
          {content.duas.length === 0 ? (
            <EmptyTab text="Huna alama za Dua bado. Weka alama kwenye Dua unazopenda." />
          ) : (
            content.duas.map((dua) => (
              <Card key={dua.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <CategoryBadges categories={dua.categories} />
                      <p className="text-sm text-muted-foreground line-clamp-2">{dua.swahiliTranslation}</p>
                      <p className="text-xs text-muted-foreground">{dua.occasion}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemove("dua", dua.id, "Dua")} aria-label="Ondoa alama">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="adhkar" className="space-y-4 mt-6">
          {content.adhkar.length === 0 ? (
            <EmptyTab text="Huna alama za Adhkar bado. Weka alama kwenye Adhkar unazopenda." />
          ) : (
            content.adhkar.map((adhkar) => (
              <Card key={adhkar.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <CategoryBadges categories={adhkar.categories} />
                      <p className="text-sm text-muted-foreground line-clamp-2">{adhkar.swahiliTranslation}</p>
                      <p className="text-xs text-muted-foreground">{adhkar.reference}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemove("adhkar", adhkar.id, "Adhkar")} aria-label="Ondoa alama">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="articles" className="space-y-4 mt-6">
          <OfflineHint />
          {content.articles.length === 0 ? (
            <EmptyTab text="Huna alama za Makala bado. Weka alama kwenye makala unazopenda." />
          ) : (
            content.articles.map((article) => (
              <Card key={article.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <CategoryBadges categories={article.categories} />
                      <h3 className="font-medium">{article.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{article.content}</p>
                      <Link href={`/articles/${article.id}`}>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Soma zaidi
                        </Button>
                      </Link>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemove("article", article.id, "Makala")} aria-label="Ondoa alama">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="books" className="space-y-4 mt-6">
          <OfflineHint />
          {content.books.length === 0 ? (
            <EmptyTab text="Huna alama za Vitabu bado. Weka alama kwenye vitabu unavyopenda." />
          ) : (
            content.books.map((book) => (
              <Card key={book.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <CategoryBadges categories={book.categories} />
                      <h3 className="font-medium">{book.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{book.description}</p>
                      <Link href={`/vitabu/${book.id}`}>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Soma zaidi
                        </Button>
                      </Link>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemove("media", book.id, "Kitabu")} aria-label="Ondoa alama">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyTab({ text }: { text: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{text}</CardDescription>
      </CardHeader>
    </Card>
  )
}

function OfflineHint() {
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <CloudOff className="h-3.5 w-3.5" aria-hidden />
      Alama za Makala na Vitabu zinahitaji mtandao kuonyeshwa.
    </p>
  )
}
