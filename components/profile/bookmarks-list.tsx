"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CategoryBadges } from "@/components/ui/category-badges"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, HandHeart, Library, Scroll, Sparkles, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useBookmarks, type BookmarkContentType } from "@/hooks/use-bookmarks"
import { createClient } from "@/lib/supabase/client"
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

export function BookmarksList() {
  const { toggleBookmark } = useBookmarks()
  const { toast } = useToast()
  const [content, setContent] = useState<BookmarkedContent>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) {
        if (active) setLoading(false)
        return
      }
      if (active) setSignedIn(true)

      const { data: bookmarkRows } = await supabase
        .from("bookmarks")
        .select("content_type, content_id")
        .eq("user_id", user.id)

      if (!active) return
      const rows = bookmarkRows ?? []
      const idsFor = (type: BookmarkContentType) => rows.filter((r) => r.content_type === type).map((r) => r.content_id)

      const [verseRes, hadithRes, duaRes, adhkarRes, articleRes, bookRes] = await Promise.all([
        idsFor("quran_verse").length ? supabase.from("quran_verses").select("*").in("id", idsFor("quran_verse")) : Promise.resolve({ data: [] }),
        idsFor("hadith").length ? supabase.from("hadiths").select("*").in("id", idsFor("hadith")) : Promise.resolve({ data: [] }),
        idsFor("dua").length ? supabase.from("duas").select("*").in("id", idsFor("dua")) : Promise.resolve({ data: [] }),
        idsFor("adhkar").length ? supabase.from("adhkar").select("*").in("id", idsFor("adhkar")) : Promise.resolve({ data: [] }),
        idsFor("article").length ? supabase.from("articles").select("*").in("id", idsFor("article")) : Promise.resolve({ data: [] }),
        idsFor("media").length ? supabase.from("media_items").select("*").in("id", idsFor("media")) : Promise.resolve({ data: [] }),
      ])

      if (!active) return
      setContent({
        quranVerses: (verseRes.data ?? []).map(mapQuranVerse),
        hadiths: (hadithRes.data ?? []).map(mapHadith),
        duas: (duaRes.data ?? []).map(mapDua),
        adhkar: (adhkarRes.data ?? []).map(mapAdhkar),
        articles: (articleRes.data ?? []).map(mapArticle),
        books: (bookRes.data ?? []).map(mapBook),
      })
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [])

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

  if (!loading && !signedIn) {
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

  return (
    <Tabs defaultValue="quran" className="w-full">
      <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
        <TabsTrigger value="quran" className="gap-2">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Qur&apos;ani</span> ({content.quranVerses.length})
        </TabsTrigger>
        <TabsTrigger value="hadith" className="gap-2">
          <Scroll className="h-4 w-4" />
          <span className="hidden sm:inline">Hadith</span> ({content.hadiths.length})
        </TabsTrigger>
        <TabsTrigger value="dua" className="gap-2">
          <HandHeart className="h-4 w-4" />
          <span className="hidden sm:inline">Dua</span> ({content.duas.length})
        </TabsTrigger>
        <TabsTrigger value="adhkar" className="gap-2">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Adhkar</span> ({content.adhkar.length})
        </TabsTrigger>
        <TabsTrigger value="articles" className="gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Makala</span> ({content.articles.length})
        </TabsTrigger>
        <TabsTrigger value="books" className="gap-2">
          <Library className="h-4 w-4" />
          <span className="hidden sm:inline">Vitabu</span> ({content.books.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="quran" className="space-y-4 mt-6">
        {content.quranVerses.length === 0 ? (
          <Card>
            <CardHeader>
              <CardDescription>Huna alama za Qur&apos;ani bado. Weka alama kwenye aya unazopenda.</CardDescription>
            </CardHeader>
          </Card>
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
          <Card>
            <CardHeader>
              <CardDescription>Huna alama za Hadith bado. Weka alama kwenye Hadith unazopenda.</CardDescription>
            </CardHeader>
          </Card>
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
          <Card>
            <CardHeader>
              <CardDescription>Huna alama za Dua bado. Weka alama kwenye Dua unazopenda.</CardDescription>
            </CardHeader>
          </Card>
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
          <Card>
            <CardHeader>
              <CardDescription>Huna alama za Adhkar bado. Weka alama kwenye Adhkar unazopenda.</CardDescription>
            </CardHeader>
          </Card>
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
        {content.articles.length === 0 ? (
          <Card>
            <CardHeader>
              <CardDescription>Huna alama za Makala bado. Weka alama kwenye makala unazopenda.</CardDescription>
            </CardHeader>
          </Card>
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
        {content.books.length === 0 ? (
          <Card>
            <CardHeader>
              <CardDescription>Huna alama za Vitabu bado. Weka alama kwenye vitabu unavyopenda.</CardDescription>
            </CardHeader>
          </Card>
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
  )
}
