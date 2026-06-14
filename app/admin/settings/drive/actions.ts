"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/require-admin"
import { createServiceClient } from "@/lib/supabase/server"

export async function disconnectDrive() {
  const admin = await requireAdmin()
  if (!admin) throw new Error("Forbidden")

  const supabase = createServiceClient()
  await supabase
    .from("google_drive_tokens")
    .update({
      refresh_token: null,
      connected_email: null,
      books_folder_id: null,
      audio_folder_id: null,
      video_folder_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)

  revalidatePath("/admin/settings/drive")
}
