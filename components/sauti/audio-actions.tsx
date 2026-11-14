"use client"

import { MediaActions } from "@/components/media/media-actions"
import type { Audio } from "@/lib/types"

interface AudioActionsProps {
  audio: Audio
}

export function AudioActions({ audio }: AudioActionsProps) {
  return (
    <MediaActions
      id={audio.id}
      title={audio.title}
      author={audio.author}
      description={audio.description}
      fileUrl={audio.fileUrl}
      savedDescription="Sauti imehifadhiwa"
    />
  )
}
