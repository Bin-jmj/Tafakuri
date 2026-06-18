"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/require-admin"
import { createServiceClient } from "@/lib/supabase/server"

export async function updateRotationSettings(formData: FormData): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  if (!admin) return { error: "Hauruhusiwi" }

  const get = (key: string) => String(formData.get(key) ?? "")

  const supabase = createServiceClient()
  const clampSeconds = (v: string) => Math.max(5, Math.min(3600, Number(v) || 30))
  const asubuhiRotateSeconds = clampSeconds(get("adhkar_asubuhi_rotate_seconds"))
  const jioniRotateSeconds = clampSeconds(get("adhkar_jioni_rotate_seconds"))

  const { error } = await supabase
    .from("rotation_settings")
    .update({
      adhkar_asubuhi_start: get("adhkar_asubuhi_start"),
      adhkar_jioni_start: get("adhkar_jioni_start"),
      adhkar_asubuhi_rotate_seconds: asubuhiRotateSeconds,
      adhkar_jioni_rotate_seconds: jioniRotateSeconds,
      sunrise_time: get("sunrise_time"),
      sunset_time: get("sunset_time"),
      content_fajr_start: get("content_fajr_start"),
      content_dhuhr_start: get("content_dhuhr_start"),
      content_asr_start: get("content_asr_start"),
      content_maghrib_start: get("content_maghrib_start"),
      content_isha_start: get("content_isha_start"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)

  if (error) return { error: error.message }

  revalidatePath("/admin/settings/muda")
  revalidatePath("/")
  return {}
}
