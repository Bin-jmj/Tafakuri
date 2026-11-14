import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { mapYoutubeChannel } from "@/lib/mappers"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CategoryBadges } from "@/components/ui/category-badges"
import { ChevronLeft, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export default async function YoutubeChannelPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: row } = await supabase.from("youtube_channels").select("*").eq("id", id).eq("is_available", true).maybeSingle()
  if (!row) notFound()

  const channel = mapYoutubeChannel(row)
  const watchUrl = channel.channelUrl ?? `https://www.youtube.com/playlist?list=${channel.playlistId}`

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <Link href="/video">
        <Button variant="ghost" size="sm" className="mb-4 gap-1.5 -ml-2">
          <ChevronLeft className="h-4 w-4" />
          Rudi kwenye Video
        </Button>
      </Link>

      <Card className="border-border/50 overflow-hidden">
        <div className="aspect-video w-full bg-muted">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/videoseries?list=${channel.playlistId}`}
            title={channel.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <CardContent className="p-5 space-y-3">
          <CategoryBadges categories={channel.categories} />
          <h1 className="text-xl md:text-2xl font-bold leading-tight">{channel.name}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{channel.description}</p>
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <a href={watchUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Fungua kwenye YouTube
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
