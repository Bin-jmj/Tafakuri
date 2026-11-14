"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CategoryBadges } from "@/components/ui/category-badges"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bookmark, BookmarkCheck, Download, Loader2, Search, Share2, Video as VideoIcon } from "lucide-react"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useToast } from "@/hooks/use-toast"
import { shareContent } from "@/lib/utils/share"
import { downloadFile } from "@/lib/utils/download"
import { formatDuration } from "@/lib/utils/duration"
import type { Video } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"

const CATEGORIES = ["Zote", "Hadith", "Fiqh", "Tafsiri", "Akida", "Siira"]

interface VideoGridProps {
  videos: Video[]
}

export function VideoGrid({ videos }: VideoGridProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Zote")
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const { toast } = useToast()

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      const matchSearch =
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.author.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === "Zote" || v.categories.includes(category)
      return matchSearch && matchCat
    })
  }, [videos, search, category])

  const handleBookmark = async (videoId: string) => {
    const wasBookmarked = isBookmarked("media", videoId)
    const ok = await toggleBookmark("media", videoId)
    if (!ok) return
    toast(wasBookmarked ? { title: "Alama imeondolewa" } : { title: "Imehifadhiwa", description: "Video imehifadhiwa kwenye alama zako" })
  }

  const handleShare = async (video: Video) => {
    await shareContent(video.title, `${video.title} na ${video.author}\n\n${video.description}`)
  }

  const handleDownload = async (video: Video) => {
    if (!video.fileUrl) return
    setDownloadingId(video.id)
    try {
      await downloadFile(video.fileUrl, video.title)
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
            placeholder="Tafuta video au mwandishi..."
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
        Video {filtered.length} zinapatikana
      </p>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((video) => {
          const booked = isBookmarked("media", video.id)
          return (
            <Card key={video.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow border-border/60">
              {/* Cover */}
              <div className="relative h-48 bg-muted overflow-hidden">
                {video.coverUrl ? (
                  <Image
                    src={video.coverUrl}
                    alt={video.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <VideoIcon className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <CategoryBadges categories={video.categories} />
                </div>
              </div>

              <CardContent className="flex-1 p-4 space-y-2">
                <h3 className="font-bold text-base leading-tight line-clamp-2">{video.title}</h3>
                <p className="text-sm text-muted-foreground">{video.author}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{video.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                  {video.durationSeconds && <span>{formatDuration(video.durationSeconds)}</span>}
                  {video.publishedYear && <span>•</span>}
                  {video.publishedYear && <span>{video.publishedYear}</span>}
                  <span>•</span>
                  <span>{video.downloadCount.toLocaleString()} pakuzi</span>
                </div>
              </CardContent>

              <CardFooter className="p-3 pt-0 flex gap-2">
                <Link href={`/video/${video.id}`} className="flex-1">
                  <Button size="sm" className="w-full gap-1.5">
                    <VideoIcon className="h-3.5 w-3.5" />
                    Tazama
                  </Button>
                </Link>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleBookmark(video.id)}>
                  {booked ? <BookmarkCheck className="h-3.5 w-3.5 text-primary" /> : <Bookmark className="h-3.5 w-3.5" />}
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleShare(video)}>
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  title="Pakua video"
                  disabled={downloadingId === video.id || !video.fileUrl}
                  onClick={() => handleDownload(video)}
                >
                  {downloadingId === video.id ? (
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
          <VideoIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Hakuna video zilizopatikana</p>
          <p className="text-sm mt-1">Jaribu kutafuta kwa maneno mengine</p>
        </div>
      )}
    </>
  )
}
