"use client"

import { MediaActions } from "@/components/media/media-actions"
import type { Video } from "@/lib/types"

interface VideoActionsProps {
  video: Video
}

export function VideoActions({ video }: VideoActionsProps) {
  return (
    <MediaActions
      id={video.id}
      title={video.title}
      author={video.author}
      description={video.description}
      fileUrl={video.fileUrl}
      savedDescription="Video imehifadhiwa"
    />
  )
}
