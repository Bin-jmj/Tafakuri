"use client"

interface VideoPlayerProps {
  fileUrl: string
}

export function VideoPlayer({ fileUrl }: VideoPlayerProps) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video controls className="h-full w-full" src={fileUrl} preload="metadata">
        Kivinjari chako hakitumii uchezaji wa video.
      </video>
    </div>
  )
}
