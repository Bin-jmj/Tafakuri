import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { quranJuzList } from "@/lib/quran-juz"

// GET /api/precache-manifest — the full, current list of URLs that make up
// the offline-readable "core content" (Qur'an, Hadith, Dua, Adhkar). Built
// from the live database each time, so it always matches whatever surahs/
// categories currently exist — nothing is hardcoded, so it never goes stale
// when admin adds/removes a category. Vitabu (books/audio/video) is
// intentionally excluded — those are large media files downloaded on demand.
export async function GET() {
  const supabase = await createClient()

  const [{ data: versionRow }, { data: surahRows }, { data: categoryRows }] = await Promise.all([
    supabase.from("content_meta").select("version").eq("id", 1).single(),
    supabase.from("surahs").select("id"),
    supabase.from("categories").select("name, type").in("type", ["hadith", "dua", "adhkar"]),
  ])

  const urls = new Set<string>(["/", "/quran", "/hadith", "/dua", "/adhkar"])

  for (const surah of surahRows ?? []) {
    urls.add(`/quran/${surah.id}`)
  }
  for (const juz of quranJuzList) {
    urls.add(`/quran/juz/${juz.number}`)
  }
  for (const category of categoryRows ?? []) {
    urls.add(`/${category.type}/${encodeURIComponent(category.name)}`)
  }

  return NextResponse.json({
    version: versionRow?.version ?? 0,
    urls: Array.from(urls),
  })
}
