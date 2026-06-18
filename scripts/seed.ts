// Seeds the Supabase database with the bundled mock content.
// Run with: pnpm seed
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env

import { createClient } from "@supabase/supabase-js"
import type { Database } from "../lib/supabase/types"
import {
  mockSurahs,
  mockVerses,
  mockHadiths,
  mockArticles,
  mockDuas,
  mockAdhkar,
  mockBooks,
} from "../lib/mock-data"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
}

const supabase = createClient<Database>(url, serviceKey, { auth: { persistSession: false } })

async function seedSurahs() {
  const rows = mockSurahs.map((s) => ({
    id: s.id,
    name: s.name,
    arabic_name: s.arabicName,
    number_of_verses: s.numberOfVerses,
    revelation_type: s.revelationType,
    juz_start: s.juzStart,
  }))
  const { error } = await supabase.from("surahs").upsert(rows, { onConflict: "id" })
  if (error) throw error
  console.log(`Surahs: ${rows.length}`)
}

async function seedQuranVerses() {
  const rows = mockVerses.map((v) => ({
    surah_number: v.surahNumber,
    verse_number: v.verseNumber,
    arabic_text: v.arabicText,
    translation_sw: v.swahiliTranslation,
    tafsir: v.tafsir ?? null,
    moral: v.moral ?? null,
  }))
  const { error } = await supabase.from("quran_verses").upsert(rows, { onConflict: "surah_number,verse_number" })
  if (error) throw error
  console.log(`Quran verses: ${rows.length}`)
}

async function seedHadiths() {
  const rows = mockHadiths.map((h) => ({
    arabic_text: h.arabicText,
    translation_sw: h.swahiliTranslation,
    narrator: h.narrator,
    source: h.source,
    categories: h.categories,
  }))
  const { error } = await supabase.from("hadiths").insert(rows)
  if (error) throw error
  console.log(`Hadiths: ${rows.length}`)
}

async function seedArticles() {
  const rows = mockArticles.map((a) => ({
    title: a.title,
    content: a.content,
    categories: a.categories,
    author: a.author,
    published_date: a.publishedDate.slice(0, 10),
    image_url: a.imageUrl ?? null,
  }))
  const { error } = await supabase.from("articles").insert(rows)
  if (error) throw error
  console.log(`Articles: ${rows.length}`)
}

async function seedDuas() {
  const rows = mockDuas.map((d) => ({
    arabic_text: d.arabicText,
    translation_sw: d.swahiliTranslation,
    transliteration: d.transliteration ?? null,
    categories: d.categories,
    occasion: d.occasion ?? null,
    reference: d.reference ?? null,
  }))
  const { error } = await supabase.from("duas").insert(rows)
  if (error) throw error
  console.log(`Duas: ${rows.length}`)
}

async function seedAdhkar() {
  const rows = mockAdhkar.map((a) => ({
    arabic_text: a.arabicText,
    translation_sw: a.swahiliTranslation,
    transliteration: a.transliteration ?? null,
    count: a.count,
    benefit: a.benefit ?? null,
    reference: a.reference ?? null,
    slot: a.slot,
    categories: a.categories,
    sort_order: a.order,
  }))
  const { error } = await supabase.from("adhkar").insert(rows)
  if (error) throw error
  console.log(`Adhkar: ${rows.length}`)
}

async function seedBooks() {
  const rows = mockBooks.map((b) => ({
    type: "book" as const,
    title: b.title,
    author: b.author,
    description: b.description,
    categories: b.categories,
    language: b.language,
    cover_url: b.coverUrl ?? null,
    total_pages: b.totalPages ?? null,
    published_year: b.publishedYear ?? null,
    download_count: b.downloadCount,
    is_available: b.isAvailable,
  }))
  const { error } = await supabase.from("media_items").insert(rows)
  if (error) throw error
  console.log(`Books: ${rows.length}`)
}

async function main() {
  await seedSurahs()
  await seedQuranVerses()

  const { count: hadithCount } = await supabase.from("hadiths").select("*", { count: "exact", head: true })
  if (!hadithCount) await seedHadiths()

  const { count: articleCount } = await supabase.from("articles").select("*", { count: "exact", head: true })
  if (!articleCount) await seedArticles()

  const { count: duaCount } = await supabase.from("duas").select("*", { count: "exact", head: true })
  if (!duaCount) await seedDuas()

  const { count: adhkarCount } = await supabase.from("adhkar").select("*", { count: "exact", head: true })
  if (!adhkarCount) await seedAdhkar()

  const { count: mediaCount } = await supabase.from("media_items").select("*", { count: "exact", head: true })
  if (!mediaCount) await seedBooks()

  console.log("Seed complete.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
