"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CategoryBadges } from "@/components/ui/category-badges"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Search, Share2, Youtube } from "lucide-react"
import { shareContent } from "@/lib/utils/share"
import type { YoutubeChannel } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"

interface YoutubeChannelGridProps {
  channels: YoutubeChannel[]
}

export function YoutubeChannelGrid({ channels }: YoutubeChannelGridProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    return channels.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  }, [channels, search])

  const handleShare = async (channel: YoutubeChannel) => {
    await shareContent(channel.name, channel.description)
  }

  return (
    <>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tafuta kituo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((channel) => (
          <Card key={channel.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow border-border/60">
            <div className="relative h-48 bg-muted overflow-hidden">
              {channel.coverUrl ? (
                <Image src={channel.coverUrl} alt={channel.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Youtube className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <CategoryBadges categories={channel.categories} />
              </div>
            </div>

            <CardContent className="flex-1 p-4 space-y-2">
              <h3 className="font-bold text-base leading-tight line-clamp-2">{channel.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{channel.description}</p>
            </CardContent>

            <CardFooter className="p-3 pt-0 flex gap-2">
              <Link href={`/video/youtube/${channel.id}`} className="flex-1">
                <Button size="sm" className="w-full gap-1.5">
                  <Play className="h-3.5 w-3.5" />
                  Tazama
                </Button>
              </Link>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleShare(channel)}>
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Youtube className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Hakuna vituo vilivyopatikana</p>
          <p className="text-sm mt-1">Jaribu kutafuta kwa maneno mengine</p>
        </div>
      )}
    </>
  )
}
