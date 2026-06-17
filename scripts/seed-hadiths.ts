// Seeds hadiths from scripts/data/hadiths.json
// Run with: pnpm seed:hadiths
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

interface HadithEntry {
  arabicText: string
  translationSw: string
  narrator: string
  source: string
  category: string
}

async function main() {
  const filePath = join(import.meta.dirname ?? __dirname, "data", "hadiths.json")
  const entries: HadithEntry[] = JSON.parse(readFileSync(filePath, "utf-8"))

  const rows = entries.map((h) => ({
    arabic_text: h.arabicText,
    translation_sw: h.translationSw,
    narrator: h.narrator,
    source: h.source,
    category: h.category,
  }))

  console.log(`Seeding ${rows.length} hadiths...`)

  // Insert in batches of 20
  for (let i = 0; i < rows.length; i += 20) {
    const batch = rows.slice(i, i + 20)
    const { error } = await supabase.from("hadiths").insert(batch)
    if (error) {
      console.error(`Batch ${Math.floor(i / 20) + 1} failed:`, error.message)
      process.exit(1)
    }
    console.log(`  Inserted rows ${i + 1}–${Math.min(i + 20, rows.length)}`)
  }

  console.log("Done.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
