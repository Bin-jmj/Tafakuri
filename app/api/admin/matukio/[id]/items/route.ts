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

function previewLabel(type: ContentType, row: Record<string, unknown> | undefined): string {
  if (!row) return "(maudhui yamefutwa)"
  const translation = String(row.translation_sw ?? "").slice(0, 80)
  if (type === "quran_verse") return `Surat ${row.surah_number}:${row.verse_number} — ${translation}`
  return translation
}

// GET /api/admin/matukio/[id]/items?type=hadith — list this occasion's
// content pool for one content type, with a readable preview label.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") as ContentType | null
  if (!type || !TABLES[type]) return NextResponse.json({ error: "Aina si sahihi" }, { status: 400 })

  const supabase = createServiceClient()
  const { data: items, error } = await supabase
    .from("occasion_items")
    .select("*")
    .eq("occasion_id", id)
    .eq("content_type", type)
    .order("sort_order", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!items || items.length === 0) return NextResponse.json({ data: [] })

  const contentIds = items.map((item) => item.content_id)
  const { data: contentRows } = await supabase.from(TABLES[type]).select("*").in("id", contentIds)
  const contentMap = new Map(
    (contentRows ?? []).map((row) => [String((row as Record<string, unknown>).id), row as Record<string, unknown>]),
  )

  const results = items.map((item) => ({
    itemId: item.id,
    contentId: item.content_id,
    label: previewLabel(type, contentMap.get(item.content_id)),
  }))

  return NextResponse.json({ data: results })
}

// POST /api/admin/matukio/[id]/items — body: { content_type, content_id }
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await request.json().catch(() => null)
  const contentType = body?.content_type as ContentType | undefined
  const contentId = body?.content_id as string | undefined
  if (!contentType || !TABLES[contentType] || !contentId) {
    return NextResponse.json({ error: "Data si sahihi" }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from("occasion_items").insert({
    occasion_id: id,
    content_type: contentType,
    content_id: contentId,
  })

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Tayari imeongezwa kwenye tukio hili" }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
