// Nightly job (scheduled via pg_cron, see 0004_media_availability_cron_setup.sql).
// For every media_item with a drive_file_id, checks whether the file still
// exists in Google Drive and updates is_available accordingly.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const ALGORITHM = { name: "AES-GCM", tagLength: 128 }

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

/** Decrypts a payload produced by lib/drive/crypto.ts's `encrypt` (iv:authTag:ciphertext, all hex). */
async function decryptRefreshToken(payload: string): Promise<string> {
  const [ivHex, authTagHex, ciphertextHex] = payload.split(":")
  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error("Invalid encrypted payload")
  }

  const keyHex = Deno.env.get("DRIVE_TOKEN_ENCRYPTION_KEY")
  if (!keyHex || keyHex.length !== 64) {
    throw new Error("DRIVE_TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)")
  }

  const key = await crypto.subtle.importKey("raw", hexToBytes(keyHex), ALGORITHM, false, ["decrypt"])
  const iv = hexToBytes(ivHex)
  // Web Crypto expects ciphertext with the auth tag appended.
  const ciphertextWithTag = new Uint8Array([...hexToBytes(ciphertextHex), ...hexToBytes(authTagHex)])

  const plaintext = await crypto.subtle.decrypt({ ...ALGORITHM, iv }, key, ciphertextWithTag)
  return new TextDecoder().decode(plaintext)
}

async function getDriveAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })

  if (!res.ok) {
    throw new Error(`Failed to refresh Google access token: ${res.status}`)
  }

  const json = await res.json()
  return json.access_token as string
}

/** Returns true if the Drive file exists and is accessible, false if it was removed/trashed. */
async function driveFileExists(fileId: string, accessToken: string): Promise<boolean> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,trashed`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  if (res.status === 404) return false
  if (!res.ok) {
    // Transient error (rate limit, network, etc.) — don't flip availability.
    throw new Error(`Drive lookup for ${fileId} failed: ${res.status}`)
  }

  const json = await res.json()
  return json.trashed !== true
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  )

  const { data: tokenRow } = await supabase
    .from("google_drive_tokens")
    .select("refresh_token")
    .eq("id", 1)
    .maybeSingle()

  if (!tokenRow?.refresh_token) {
    return new Response(JSON.stringify({ error: "Google Drive is not connected" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { data: items, error } = await supabase
    .from("media_items")
    .select("id, drive_file_id, is_available")
    .not("drive_file_id", "is", null)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const refreshToken = await decryptRefreshToken(tokenRow.refresh_token)
  const accessToken = await getDriveAccessToken(refreshToken)

  let checked = 0
  let updated = 0
  const failures: string[] = []

  for (const item of items ?? []) {
    if (!item.drive_file_id) continue
    checked++

    let exists: boolean
    try {
      exists = await driveFileExists(item.drive_file_id, accessToken)
    } catch (err) {
      failures.push(item.id)
      console.error(err)
      continue
    }

    if (exists !== item.is_available) {
      await supabase
        .from("media_items")
        .update({ is_available: exists, updated_at: new Date().toISOString() })
        .eq("id", item.id)
      updated++
    }
  }

  return new Response(JSON.stringify({ checked, updated, failed: failures.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
})
