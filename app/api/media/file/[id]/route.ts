import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const SIGNED_URL_TTL_SECONDS = 60

// GET /api/media/file/[id] — redirects to a short-lived signed URL for the
// book/audio/video file backing this media_items row. Keyed by the row id
// (not the storage path) so the path is never exposed, and the redirect
// target is cached by the service worker/PDF reader as the actual file
// bytes (fetch() follows redirects), so cached entries stay valid even
// after the signed URL itself expires.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = createServiceClient()
  const { data: item } = await supabase
    .from("media_items")
    .select("id, storage_path, is_available, download_count")
    .eq("id", id)
    .maybeSingle()

  if (!item || !item.is_available || !item.storage_path) {
    return NextResponse.json({ error: "Faili haipatikani" }, { status: 404 })
  }

  await supabase
    .from("media_items")
    .update({ download_count: item.download_count + 1 })
    .eq("id", item.id)

  const { data, error } = await supabase.storage
    .from("media")
    .createSignedUrl(item.storage_path, SIGNED_URL_TTL_SECONDS)

  if (error || !data) {
    console.error("[media-file] signed url failed", error)
    return NextResponse.json({ error: "Imeshindikana kupakua faili" }, { status: 502 })
  }

  return NextResponse.redirect(data.signedUrl)
}
