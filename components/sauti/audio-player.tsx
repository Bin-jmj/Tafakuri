"use client"

import { Headphones } from "lucide-react"

interface AudioPlayerProps {
  fileUrl: string
}

export function AudioPlayer({ fileUrl }: AudioPlayerProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Headphones className="h-9 w-9 text-muted-foreground" />
      </div>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio controls className="w-full" src={fileUrl} preload="metadata">
        Kivinjari chako hakitumii uchezaji wa sauti.
      </audio>
    </div>
  )
}
