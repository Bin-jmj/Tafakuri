import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { mapArticle, mapDua, mapHadith, mapQuranVerse } from "@/lib/mappers"
import { DuaCard } from "@/components/dua/dua-card"
import { ArticleCard } from "@/components/articles/article-card"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CategoryBadges } from "@/components/ui/category-badges"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, HandHeart, Library, Scroll, Search, BookOpenCheck, Headphones, Video } from "lucide-react"

interface Props {
  searchParams: Promise<{ q?: string }>
}

const mediaTypeIcon = { book: BookOpenCheck, audio: Headphones, video: Video } as const
const mediaTypeLabel = { book: "Kitabu", audio: "Sauti", video: "Video" } as const

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = (q ?? "").trim()

  let verses: ReturnType<typeof mapQuranVerse>[] = []
  let hadiths: ReturnType<typeof mapHadith>[] = []
  let duas: ReturnType<typeof mapDua>[] = []
  let articles: ReturnType<typeof mapArticle>[] = []
  let media: { id: string; type: "book" | "audio" | "video"; title: string; author: string | null; categories: string[]; cover_url: string | null }[] = []
  const surahNames = new Map<string, string>()

  if (query) {
    const supabase = await createClient()
    const [versesRes, hadithsRes, duasRes, articlesRes, mediaRes] = await Promise.all([
      supabase.rpc("search_quran_verses", { query, max_results: 20 }),
      supabase.rpc("search_hadiths", { query, max_results: 20 }),
      supabase.rpc("search_duas", { query, max_results: 20 }),
      supabase.rpc("search_articles", { query, max_results: 20 }),
      supabase.rpc("search_media_items", { query, max_results: 20 }),
    ])

    verses = (versesRes.data ?? []).map(mapQuranVerse)
    hadiths = (hadithsRes.data ?? []).map(mapHadith)
    duas = (duasRes.data ?? []).map(mapDua)
    articles = (articlesRes.data ?? []).map(mapArticle)
    media = mediaRes.data ?? []

    if (verses.length > 0) {
      const surahNumbers = Array.from(new Set(verses.map((v) => v.surahNumber)))
      const { data: surahRows } = await supabase.from("surahs").select("id, name").in("id", surahNumbers)
      const names = new Map((surahRows ?? []).map((s) => [s.id, s.name]))
      verses.forEach((v) => {
        surahNames.set(v.id, names.get(v.surahNumber) ?? `Surah ${v.surahNumber}`)
      })
    }
  }

  const totalResults = verses.length + hadiths.length + duas.length + articles.length + media.length

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Tafuta
        </h1>
        <form action="/search" method="GET" className="flex gap-2">
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Tafuta aya, hadithi, dua, makala au vitabu..."
            className="flex-1"
            autoFocus
          />
          <Button type="submit">Tafuta</Button>
        </form>
      </div>

      {!query ? (
        <p className="text-sm text-muted-foreground">Andika neno la kutafuta ili kuona matokeo.</p>
      ) : totalResults === 0 ? (
        <Card>
          <CardHeader>
            <CardDescription>Hakuna matokeo yaliyopatikana kwa &quot;{query}&quot;.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
            <TabsTrigger value="all">Zote ({totalResults})</TabsTrigger>
            <TabsTrigger value="quran" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Qur&apos;ani</span> ({verses.length})
            </TabsTrigger>
            <TabsTrigger value="hadith" className="gap-1.5">
              <Scroll className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Hadith</span> ({hadiths.length})
            </TabsTrigger>
            <TabsTrigger value="dua" className="gap-1.5">
              <HandHeart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dua</span> ({duas.length})
            </TabsTrigger>
            <TabsTrigger value="articles" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Makala</span> ({articles.length})
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-1.5">
              <Library className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Maktaba</span> ({media.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {verses.map((verse) => <VerseResultCard key={verse.id} verse={verse} surahName={surahNames.get(verse.id)} />)}
            {hadiths.map((hadith) => <HadithResultCard key={hadith.id} hadith={hadith} />)}
            {duas.map((dua) => <DuaCard key={dua.id} dua={dua} />)}
            {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
            {media.map((item) => <MediaResultCard key={item.id} item={item} />)}
          </TabsContent>

          <TabsContent value="quran" className="space-y-4 mt-6">
            {verses.length === 0 ? (
              <EmptyState text="Hakuna aya zilizopatikana." />
            ) : (
              verses.map((verse) => <VerseResultCard key={verse.id} verse={verse} surahName={surahNames.get(verse.id)} />)
            )}
          </TabsContent>

          <TabsContent value="hadith" className="space-y-4 mt-6">
            {hadiths.length === 0 ? <EmptyState text="Hakuna hadithi zilizopatikana." /> : hadiths.map((hadith) => <HadithResultCard key={hadith.id} hadith={hadith} />)}
          </TabsContent>

          <TabsContent value="dua" className="space-y-4 mt-6">
            {duas.length === 0 ? <EmptyState text="Hakuna dua zilizopatikana." /> : duas.map((dua) => <DuaCard key={dua.id} dua={dua} />)}
          </TabsContent>

          <TabsContent value="articles" className="space-y-4 mt-6">
            {articles.length === 0 ? <EmptyState text="Hakuna makala zilizopatikana." /> : articles.map((article) => <ArticleCard key={article.id} article={article} />)}
          </TabsContent>

          <TabsContent value="media" className="space-y-4 mt-6">
            {media.length === 0 ? <EmptyState text="Hakuna vitu vya maktaba vilivyopatikana." /> : media.map((item) => <MediaResultCard key={item.id} item={item} />)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{text}</CardDescription>
      </CardHeader>
    </Card>
  )
}

function VerseResultCard({ verse, surahName }: { verse: ReturnType<typeof mapQuranVerse>; surahName?: string }) {
  return (
    <Link href={`/quran/${verse.surahNumber}#aya-${verse.verseNumber}`}>
      <Card className="hover:border-primary/30 transition-colors">
        <CardContent className="p-4 space-y-2">
          <Badge variant="secondary">
            {surahName ?? `Surah ${verse.surahNumber}`} ({verse.surahNumber}:{verse.verseNumber})
          </Badge>
          <p className="arabic-text text-foreground leading-loose text-right">{verse.arabicText}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{verse.swahiliTranslation}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

function HadithResultCard({ hadith }: { hadith: ReturnType<typeof mapHadith> }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <CategoryBadges categories={hadith.categories} />
        <p className="text-sm text-muted-foreground line-clamp-3">{hadith.swahiliTranslation}</p>
        <p className="text-xs text-muted-foreground">
          {hadith.narrator} - {hadith.source}
        </p>
      </CardContent>
    </Card>
  )
}

function MediaResultCard({ item }: { item: { id: string; type: "book" | "audio" | "video"; title: string; author: string | null; categories: string[] } }) {
  const Icon = mediaTypeIcon[item.type]
  const content = (
    <Card className="hover:border-primary/30 transition-colors">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium leading-tight truncate">{item.title}</p>
          {item.author && <p className="text-xs text-muted-foreground truncate">{item.author}</p>}
        </div>
        <Badge variant="outline" className="text-xs flex-shrink-0">{mediaTypeLabel[item.type]}</Badge>
      </CardContent>
    </Card>
  )

  return item.type === "book" ? <Link href={`/vitabu/${item.id}`}>{content}</Link> : content
}
