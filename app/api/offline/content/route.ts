import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { mapAdhkar, mapDua, mapHadith, mapQuranVerse, mapSurah } from "@/lib/mappers"

// GET /api/offline/content — the complete "core content" bundle as JSON
// (surahs, Qur'an verses, hadiths, duas, adhkar) plus the current content
// version. The client stores this in IndexedDB (lib/offline/sync.ts) so the
// structured data survives even when the service worker's cached pages do
// not match what a component needs. Fetched only when the version reported
// by /api/content-version is newer than what was last stored.
export async function GET() {
  const supabase = await createClient()

  const [versionResult, surahResult, quranResult, hadithResult, duaResult, adhkarResult] =
    await Promise.all([
      supabase.from("content_meta").select("version").eq("id", 1).single(),
      supabase.from("surahs").select("*").order("id"),
      supabase.from("quran_verses").select("*").order("id"),
      supabase.from("hadiths").select("*").order("id"),
      supabase.from("duas").select("*").order("id"),
      supabase.from("adhkar").select("*").order("sort_order"),
    ])

  const version = versionResult.data?.version ?? 0

  if (surahResult.error || quranResult.error || hadithResult.error || duaResult.error || adhkarResult.error) {
    const error =
      surahResult.error ?? quranResult.error ?? hadithResult.error ?? duaResult.error ?? adhkarResult.error
    return NextResponse.json({ error: error?.message ?? "Failed to load content" }, { status: 500 })
  }

  return NextResponse.json({
    version,
    surahs: (surahResult.data ?? []).map(mapSurah),
    quran: (quranResult.data ?? []).map(mapQuranVerse),
    hadith: (hadithResult.data ?? []).map(mapHadith),
    dua: (duaResult.data ?? []).map(mapDua),
    adhkar: (adhkarResult.data ?? []).map(mapAdhkar),
  })
}
