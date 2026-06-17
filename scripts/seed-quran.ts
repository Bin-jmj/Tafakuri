// Seeds quran_verses with:
//   - Arabic text        : quran-uthmani
//   - Swahili translation: sw.barwani  (Ali Muhsin Al-Barwani — only Swahili edition on alquran.cloud)
//   - Tafsir             : null        (no Swahili tafsir source available — add manually per verse)
//
// Run with:  pnpm seed:quran
// Safe to re-run — upserts on (surah_number, verse_number).

import { createClient } from "@supabase/supabase-js"
import type { Database } from "../lib/supabase/types"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
}

const supabase = createClient<Database>(url, serviceKey, { auth: { persistSession: false } })

const BASE = "https://api.alquran.cloud/v1/quran"
const ARABIC_EDITION  = "quran-uthmani"
const SWAHILI_EDITION = "sw.barwani"
const BATCH_SIZE = 250

// ── Types ────────────────────────────────────────────────────────────────────

interface AlAyah {
  numberInSurah: number
  text: string
}

interface AlSurah {
  number: number
  ayahs: AlAyah[]
}

interface AlQuranResponse {
  code: number
  status: string
  data: {
    surahs: AlSurah[]
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// Detects if the API silently returned Arabic as a fallback for an unknown edition.
function looksArabic(text: string): boolean {
  const chars = text.replace(/\s/g, "")
  if (!chars.length) return false
  const arabicCount = [...chars].filter((c) => c >= "؀" && c <= "ۿ").length
  return arabicCount / chars.length > 0.8
}

async function fetchEdition(edition: string, expectArabic: boolean): Promise<Map<string, string>> {
  process.stdout.write(`  Fetching ${edition} ... `)

  const res = await fetch(`${BASE}/${edition}`)
  if (!res.ok) throw new Error(`HTTP ${res.status} — edition "${edition}" not found`)

  const json = (await res.json()) as AlQuranResponse
  if (json.code !== 200) throw new Error(`API error for "${edition}": ${json.status}`)

  // Guard: unknown edition IDs silently fall back to Arabic on alquran.cloud.
  // Catch this before inserting wrong-language data into the DB.
  const firstVerse = json.data.surahs[0]?.ayahs[0]?.text ?? ""
  if (!expectArabic && looksArabic(firstVerse)) {
    throw new Error(
      `Edition "${edition}" returned Arabic text — this identifier does not exist.\n` +
      `  Valid Swahili editions: curl "https://api.alquran.cloud/v1/edition?language=sw"`
    )
  }

  const map = new Map<string, string>()
  for (const surah of json.data.surahs) {
    for (const ayah of surah.ayahs) {
      map.set(`${surah.number}:${ayah.numberInSurah}`, ayah.text)
    }
  }

  console.log(`✓  ${map.size} verses`)
  return map
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("  Quran Seed — api.alquran.cloud")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

  const arabicMap  = await fetchEdition(ARABIC_EDITION, true)
  const swahiliMap = await fetchEdition(SWAHILI_EDITION, false)

  // ── Build rows ─────────────────────────────────────────────────────────────

  type VerseInsert = Database["public"]["Tables"]["quran_verses"]["Insert"]
  const rows: VerseInsert[] = []

  for (const [key, arabicText] of arabicMap) {
    const [surahStr, verseStr] = key.split(":")
    const surahNumber = Number(surahStr)
    const verseNumber = Number(verseStr)

    // quran-uthmani stores the Basmala as verse 1 for every surah except Surah 9.
    // For Surah 1 (Al-Fatiha) the Basmala IS verse 1 — include it.
    // For all other surahs it is a header, not a numbered verse — skip it.
    if (verseNumber === 1 && surahNumber !== 1 && surahNumber !== 9) continue

    const sw = swahiliMap.get(key)
    if (!sw) {
      console.warn(`  ⚠ Missing Swahili for ${key} — skipping`)
      continue
    }
    rows.push({
      surah_number:   surahNumber,
      verse_number:   verseNumber,
      arabic_text:    arabicText,
      translation_sw: sw,
      tafsir:         null,
    })
  }

  // ── Upsert ─────────────────────────────────────────────────────────────────

  console.log(`\nUpserting ${rows.length} verses in batches of ${BATCH_SIZE} ...\n`)

  let done = 0
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from("quran_verses")
      .upsert(batch, { onConflict: "surah_number,verse_number" })

    if (error) {
      console.error(`\n✗ Batch failed at verse ${i + 1}:`, error.message)
      process.exit(1)
    }

    done += batch.length
    const pct = Math.round((done / rows.length) * 100)
    process.stdout.write(`\r  ${done} / ${rows.length}  (${pct}%)`)
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log("\n")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log(`  ✅ ${done} verses seeded`)
  console.log(`  ✅ Swahili: ${SWAHILI_EDITION} (Al-Barwani)`)
  console.log("  ℹ  Tafsir: left empty — add manually via admin panel")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

main().catch((err) => {
  console.error("\n✗ Seed failed:", err instanceof Error ? err.message : err)
  process.exit(1)
})
