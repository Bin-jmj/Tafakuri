import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { mapAudio } from "@/lib/mappers"
import { AudioActions } from "@/components/sauti/audio-actions"
import { AudioPlayer } from "@/components/sauti/audio-player"
import { Badge } from "@/components/ui/badge"
import { CategoryBadges } from "@/components/ui/category-badges"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDuration } from "@/lib/utils/duration"
import { Calendar, ChevronLeft, Headphones, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AudioPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: audioRow } = await supabase.from("media_items").select("*").eq("id", id).eq("type", "audio").maybeSingle()
  if (!audioRow) notFound()

  const audio = mapAudio(audioRow)

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      {/* Back */}
      <Link href="/sauti">
        <Button variant="ghost" size="sm" className="mb-4 gap-1.5 -ml-2">
          <ChevronLeft className="h-4 w-4" />
          Rudi kwenye Sauti
        </Button>
      </Link>

      {/* Audio info header */}
      <Card className="mb-6 overflow-hidden border-primary/15">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-0">
            {/* Cover */}
            <div className="relative w-full sm:w-44 h-48 sm:h-auto flex-shrink-0 bg-muted">
              {audio.coverUrl ? (
                <Image src={audio.coverUrl} alt={audio.title} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Headphones className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
            </div>
            {/* Meta */}
            <div className="flex-1 p-5 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <CategoryBadges categories={audio.categories} className="mb-2" />
                  <h1 className="text-xl md:text-2xl font-bold leading-tight">{audio.title}</h1>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {audio.author}
                </span>
                {audio.publishedYear && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {audio.publishedYear}
                  </span>
                )}
                {audio.durationSeconds && (
                  <span className="flex items-center gap-1.5">
                    <Headphones className="h-3.5 w-3.5" />
                    {formatDuration(audio.durationSeconds)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{audio.description}</p>
              <Separator />
              <AudioActions audio={audio} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base">Kicheza Sauti</h2>
            <Badge variant="outline" className="text-xs">{audio.language}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {audio.fileUrl ? (
            <AudioPlayer fileUrl={audio.fileUrl} />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Headphones className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Faili la sauti hii halipo bado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
