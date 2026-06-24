import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import { createServiceClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const MAX_SIZE_BYTES = 500 * 1024 * 1024

// POST /api/storage/media — admin uploads a book/audio/video file to
// Supabase Storage. multipart/form-data: { file: File, type: "book" | "audio" | "video" }
export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get("file")
  const type = formData.get("type")

  if (!(file instanceof File) || typeof type !== "string" || !["book", "audio", "video"].includes(type)) {
    return NextResponse.json({ error: "Tafadhali chagua faili na aina sahihi" }, { status: 400 })
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Faili ni kubwa zaidi ya 500MB" }, { status: 400 })
  }

  const extension = file.name.split(".").pop() ?? "bin"
  const path = `${type}/${crypto.randomUUID()}.${extension}`

  const supabase = createServiceClient()
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type || "application/octet-stream",
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    storagePath: path,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    name: file.name,
  })
}
