import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import { createServiceClient } from "@/lib/supabase/server"

const TABLES = {
  hadith: "hadiths",
  dua: "duas",
  adhkar: "adhkar",
  quran_verse: "quran_verses",
} as const

type ContentType = keyof typeof TABLES

function previewLabel(type: ContentType, row: Record<string, unknown>): string {
  const translation = String(row.translation_sw ?? "").slice(0, 80)
  if (type === "quran_verse") return `Surat ${row.surah_number}:${row.verse_number} — ${translation}`
  return translation
}

// GET /api/admin/content-search?type=hadith&q=... — searches existing
// hadith/dua/adhkar/quran_verse rows for the occasion content picker.
export async function GET(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") as ContentType | null
  const q = searchParams.get("q")?.trim() ?? ""

  if (!type || !TABLES[type]) return NextResponse.json({ error: "Aina si sahihi" }, { status: 400 })

  const supabase = createServiceClient()
  let query = supabase.from(TABLES[type]).select("*").limit(20)
  if (q) query = query.ilike("translation_sw", `%${q}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const results = (data ?? []).map((row) => ({
    id: String((row as Record<string, unknown>).id),
    label: previewLabel(type, row as Record<string, unknown>),
  }))

  return NextResponse.json({ data: results })
}
