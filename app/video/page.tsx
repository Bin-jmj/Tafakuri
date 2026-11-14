import { Video as VideoIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoGrid } from "@/components/video/video-grid"
import { YoutubeChannelGrid } from "@/components/video/youtube-channel-grid"
import { PageHeaderCard } from "@/components/ui/page-header-card"
import { createClient } from "@/lib/supabase/server"
import { mapVideo, mapYoutubeChannel } from "@/lib/mappers"

export default async function VideoPage() {
  const supabase = await createClient()

  const [{ data: videoRows }, { data: channelRows }] = await Promise.all([
    supabase.from("media_items").select("*").eq("type", "video").order("created_at", { ascending: false }),
    supabase
      .from("youtube_channels")
      .select("*")
      .eq("is_available", true)
      .order("sort_order", { ascending: true }),
  ])

  const videos = (videoRows ?? []).map(mapVideo)
  const channels = (channelRows ?? []).map(mapYoutubeChannel)

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <PageHeaderCard
        icon={VideoIcon}
        title="Video za Kiislamu"
        description="Tazama, pakua na shiriki video za elimu ya Kiislamu kwa Kiswahili"
      />

      <Tabs defaultValue="youtube">
        <TabsList className="mb-6">
          <TabsTrigger value="youtube">Vituo vya YouTube</TabsTrigger>
          <TabsTrigger value="videos">Video Nyengine</TabsTrigger>
        </TabsList>
        <TabsContent value="youtube">
          <YoutubeChannelGrid channels={channels} />
        </TabsContent>
        <TabsContent value="videos">
          <VideoGrid videos={videos} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
