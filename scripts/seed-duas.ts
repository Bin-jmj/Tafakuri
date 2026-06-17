// Seeds duas and adhkar from scripts/data/duas.json and scripts/data/adhkar.json
// Run with: pnpm seed:duas
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

interface DuaEntry {
  arabicText: string
  translationSw: string
  transliteration?: string
  category: string
  occasion?: string
  reference?: string
}

interface AdhkarEntry {
  arabicText: string
  translationSw: string
  transliteration?: string
  slot: "asubuhi" | "jioni"
  count: number
  benefit?: string
  reference?: string
  sortOrder: number
}

async function seedDuas() {
  const filePath = join(import.meta.dirname ?? __dirname, "data", "duas.json")
  const entries: DuaEntry[] = JSON.parse(readFileSync(filePath, "utf-8"))

  const rows = entries.map((d) => ({
    arabic_text: d.arabicText,
    translation_sw: d.translationSw,
    transliteration: d.transliteration ?? null,
    category: d.category,
    occasion: d.occasion ?? null,
    reference: d.reference ?? null,
  }))

  console.log(`Seeding ${rows.length} duas...`)
  const { error } = await supabase.from("duas").insert(rows)
  if (error) {
    console.error("Duas insert failed:", error.message)
    process.exit(1)
  }
  console.log(`  Inserted ${rows.length} duas`)
}

async function seedAdhkar() {
  const filePath = join(import.meta.dirname ?? __dirname, "data", "adhkar.json")
  const entries: AdhkarEntry[] = JSON.parse(readFileSync(filePath, "utf-8"))

  const rows = entries.map((a) => ({
    arabic_text: a.arabicText,
    translation_sw: a.translationSw,
    transliteration: a.transliteration ?? null,
    slot: a.slot,
    count: a.count,
    benefit: a.benefit ?? null,
    reference: a.reference ?? null,
    sort_order: a.sortOrder,
  }))

  console.log(`Seeding ${rows.length} adhkar...`)
  const { error } = await supabase.from("adhkar").insert(rows)
  if (error) {
    console.error("Adhkar insert failed:", error.message)
    process.exit(1)
  }
  console.log(`  Inserted ${rows.length} adhkar`)
}

async function main() {
  await seedDuas()
  await seedAdhkar()
  console.log("Done.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
