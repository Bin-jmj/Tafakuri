// One-off migration: copies every media_items row's file from Google Drive
// into the Supabase "media" storage bucket, then records storage_path.
// Run with: pnpm migrate:drive-to-storage
// Requires Drive to be reconnected at /admin/settings/drive first - this
// reads each file from Drive one last time before the app stops depending
// on it (see docs/ARCHITECTURE.md for why Drive was dropped as the backend).

import { createClient } from "@supabase/supabase-js"
import { getDriveClient } from "../lib/drive/client"
import { withExtension } from "../lib/utils/mime"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

async function migrate() {
  const { data: rows, error } = await supabase
    .from("media_items")
    .select("id, type, title, drive_file_id, drive_mime_type")
    .not("drive_file_id", "is", null)
    .is("storage_path", null)

  if (error) throw error
  if (!rows || rows.length === 0) {
    console.log("Nothing to migrate.")
    return
  }

  console.log(`Migrating ${rows.length} file(s) from Drive to Supabase Storage...`)
  const drive = await getDriveClient()

  let migrated = 0
  let failed = 0

  for (const row of rows) {
    try {
      const driveRes = await drive.files.get(
        { fileId: row.drive_file_id!, alt: "media" },
        { responseType: "arraybuffer" },
      )
      const buffer = Buffer.from(driveRes.data as ArrayBuffer)

      const name = withExtension(row.title, row.drive_mime_type)
      const extension = name.includes(".") ? name.split(".").pop() : "bin"
      const path = `${row.type}/${row.id}.${extension}`

      const { error: uploadError } = await supabase.storage.from("media").upload(path, buffer, {
        contentType: row.drive_mime_type ?? "application/octet-stream",
        upsert: true,
      })
      if (uploadError) throw uploadError

      const { error: updateError } = await supabase
        .from("media_items")
        .update({ storage_path: path })
        .eq("id", row.id)
      if (updateError) throw updateError

      migrated++
      console.log(`  ✓ ${row.title}`)
    } catch (err) {
      failed++
      console.error(`  ✗ ${row.title}:`, err instanceof Error ? err.message : err)
    }
  }

  console.log(`Done. Migrated ${migrated}, failed ${failed}.`)
}

migrate().catch((err) => {
  console.error("Migration aborted:", err)
  process.exit(1)
})
