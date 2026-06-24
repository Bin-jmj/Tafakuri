import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/content-version — a single number that bumps whenever any Hadith,
// Dua, Adhkar, or Qur'an verse is added, edited, or removed (see migration
// 0014_content_version.sql). The PWA uses this to know when its offline
// precache of that content has gone stale.
export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("content_meta").select("version").eq("id", 1).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ version: data.version })
}
