"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CategoryBadges } from "@/components/ui/category-badges"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bookmark, BookmarkCheck, Download, Headphones, Loader2, Search, Share2 } from "lucide-react"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useToast } from "@/hooks/use-toast"
import { shareContent } from "@/lib/utils/share"
import { downloadFile } from "@/lib/utils/download"
import { formatDuration } from "@/lib/utils/duration"
import type { Audio } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"

const CATEGORIES = ["Zote", "Hadith", "Fiqh", "Tafsiri", "Akida", "Siira"]

interface AudioGridProps {
  audios: Audio[]
}

export function AudioGrid({ audios }: AudioGridProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Zote")
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const { toast } = useToast()

  const filtered = useMemo(() => {
    return audios.filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.author.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === "Zote" || a.categories.includes(category)
      return matchSearch && matchCat
    })
  }, [audios, search, category])

  const handleBookmark = async (audioId: string) => {
    const wasBookmarked = isBookmarked("media", audioId)
    const ok = await toggleBookmark("media", audioId)
    if (!ok) return
    toast(wasBookmarked ? { title: "Alama imeondolewa" } : { title: "Imehifadhiwa", description: "Sauti imehifadhiwa kwenye alama zako" })
  }

  const handleShare = async (audio: Audio) => {
    await shareContent(audio.title, `${audio.title} na ${audio.author}\n\n${audio.description}`)
  }

  const handleDownload = async (audio: Audio) => {
    if (!audio.fileUrl) return
    setDownloadingId(audio.id)
    try {
      await downloadFile(audio.fileUrl, audio.title)
    } catch (error) {
      toast({
        title: "Imeshindikana kupakua",
        description: error instanceof Error ? error.message : "Tafadhali jaribu tena baadaye.",
        variant: "destructive",
      })
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tafuta sauti au mwandishi..."
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
        Sauti {filtered.length} zinapatikana
      </p>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((audio) => {
          const booked = isBookmarked("media", audio.id)
          return (
            <Card key={audio.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow border-border/60">
              {/* Cover */}
              <div className="relative h-48 bg-muted overflow-hidden">
                {audio.coverUrl ? (
                  <Image
                    src={audio.coverUrl}
                    alt={audio.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Headphones className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <CategoryBadges categories={audio.categories} />
                </div>
              </div>

              <CardContent className="flex-1 p-4 space-y-2">
                <h3 className="font-bold text-base leading-tight line-clamp-2">{audio.title}</h3>
                <p className="text-sm text-muted-foreground">{audio.author}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{audio.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                  {audio.durationSeconds && <span>{formatDuration(audio.durationSeconds)}</span>}
                  {audio.publishedYear && <span>•</span>}
                  {audio.publishedYear && <span>{audio.publishedYear}</span>}
                  <span>•</span>
                  <span>{audio.downloadCount.toLocaleString()} pakuzi</span>
                </div>
              </CardContent>

              <CardFooter className="p-3 pt-0 flex gap-2">
                <Link href={`/sauti/${audio.id}`} className="flex-1">
                  <Button size="sm" className="w-full gap-1.5">
                    <Headphones className="h-3.5 w-3.5" />
                    Sikiliza
                  </Button>
                </Link>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleBookmark(audio.id)}>
                  {booked ? <BookmarkCheck className="h-3.5 w-3.5 text-primary" /> : <Bookmark className="h-3.5 w-3.5" />}
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleShare(audio)}>
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  title="Pakua sauti"
                  disabled={downloadingId === audio.id || !audio.fileUrl}
                  onClick={() => handleDownload(audio)}
                >
                  {downloadingId === audio.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Headphones className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Hakuna sauti zilizopatikana</p>
          <p className="text-sm mt-1">Jaribu kutafuta kwa maneno mengine</p>
        </div>
      )}
    </>
  )
}
