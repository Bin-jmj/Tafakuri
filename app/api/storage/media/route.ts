import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import { createServiceClient } from "@/lib/supabase/server"
import { extensionForMime, isAllowedMediaMimeType } from "@/lib/utils/mime"

export const runtime = "nodejs"

const MAX_SIZE_BYTES = 500 * 1024 * 1024
const MEDIA_TYPES = ["book", "audio", "video"] as const

// POST /api/storage/media — issues a short-lived signed upload URL for a
// book/audio/video file. The admin's browser then PUTs the file straight to
// Supabase Storage (see DriveFileFieldControl in cms-field-input.tsx) - the
// file body never passes through the Next.js server, so this isn't subject
// to its request-body proxy limits the way a direct POST upload would be.
// Body: { filename: string, mimeType: string, type: "book" | "audio" | "video", sizeBytes: number }
export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json().catch(() => null)
  const { filename, mimeType, type, sizeBytes } = body ?? {}

  if (
    typeof filename !== "string" ||
    typeof mimeType !== "string" ||
    typeof type !== "string" ||
    !MEDIA_TYPES.includes(type as (typeof MEDIA_TYPES)[number]) ||
    typeof sizeBytes !== "number"
  ) {
    return NextResponse.json({ error: "Tafadhali chagua faili na aina sahihi" }, { status: 400 })
  }
  if (!isAllowedMediaMimeType(type as (typeof MEDIA_TYPES)[number], mimeType)) {
    return NextResponse.json({ error: "Aina ya faili haikubaliki" }, { status: 400 })
  }
  if (sizeBytes > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Faili ni kubwa zaidi ya 500MB" }, { status: 400 })
  }

  const path = `${type}/${crypto.randomUUID()}.${extensionForMime(mimeType)}`

  const supabase = createServiceClient()
  const { data, error } = await supabase.storage.from("media").createSignedUploadUrl(path)

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Imeshindikana kuandaa upakiaji" }, { status: 500 })

  return NextResponse.json({
    storagePath: data.path,
    token: data.token,
    mimeType,
    sizeBytes,
    name: filename,
  })
}
