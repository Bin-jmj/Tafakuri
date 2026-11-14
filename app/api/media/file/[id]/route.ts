import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { extensionForMime } from "@/lib/utils/mime"

export const runtime = "nodejs"

const SIGNED_URL_TTL_SECONDS = 60

// GET /api/media/file/[id] — redirects to a short-lived signed URL for the
// book/audio/video file backing this media_items row. Keyed by the row id
// (not the storage path) so the path is never exposed, and the redirect
// target is cached by the service worker/PDF reader as the actual file
// bytes (fetch() follows redirects), so cached entries stay valid even
// after the signed URL itself expires.
//
// `download_count` only increments when the request is explicitly marked
// as a download (?download=1, set by lib/utils/download.ts) - PdfReader
// reads a book via several Range requests against this same URL, and
// counting every one of those as a "download" inflated the counter wildly.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isDownload = new URL(request.url).searchParams.get("download") === "1"

  const supabase = createServiceClient()
  const { data: item } = await supabase
    .from("media_items")
    .select("id, title, storage_path, drive_mime_type, is_available")
    .eq("id", id)
    .maybeSingle()

  if (!item || !item.is_available || !item.storage_path) {
    return NextResponse.json({ error: "Faili haipatikani" }, { status: 404 })
  }

  const filename = `${item.title}.${extensionForMime(item.drive_mime_type)}`

  const [signedUrlResult] = await Promise.all([
    supabase.storage.from("media").createSignedUrl(item.storage_path, SIGNED_URL_TTL_SECONDS, { download: filename }),
    isDownload
      ? supabase.rpc("increment_media_download_count", { media_id: item.id }).then(({ error }) => {
          if (error) console.error("[media-file] increment failed", error)
        })
      : Promise.resolve(),
  ])

  const { data, error } = signedUrlResult
  if (error || !data) {
    console.error("[media-file] signed url failed", error)
    return NextResponse.json({ error: "Imeshindikana kupakua faili" }, { status: 502 })
  }

  return NextResponse.redirect(data.signedUrl)
}
