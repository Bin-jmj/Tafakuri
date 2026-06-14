import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import { createServiceClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]
const MAX_SIZE_BYTES = 5 * 1024 * 1024

// POST /api/storage/cover — admin uploads a cover image to Supabase Storage,
// returns its public URL for use as media_items.cover_url / articles.image_url.
export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Tafadhali chagua picha" }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Aina ya picha haikubaliki (JPG, PNG, WEBP, AVIF)" }, { status: 400 })
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Picha ni kubwa zaidi ya 5MB" }, { status: 400 })
  }

  const extension = file.name.split(".").pop() ?? "jpg"
  const path = `${crypto.randomUUID()}.${extension}`

  const supabase = createServiceClient()
  const { error } = await supabase.storage.from("covers").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabase.storage.from("covers").getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
