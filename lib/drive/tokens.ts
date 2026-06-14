import { createServiceClient } from "@/lib/supabase/server"
import { decrypt, encrypt } from "./crypto"

export interface DriveFolderIds {
  books: string | null
  audio: string | null
  video: string | null
}

/** Reads the admin's decrypted Drive refresh token, if connected. */
export async function getDriveRefreshToken(): Promise<string | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from("google_drive_tokens")
    .select("refresh_token")
    .eq("id", 1)
    .maybeSingle()

  if (!data?.refresh_token) return null
  return decrypt(data.refresh_token)
}

export async function saveDriveRefreshToken(refreshToken: string, connectedEmail: string) {
  const supabase = createServiceClient()
  await supabase
    .from("google_drive_tokens")
    .upsert({
      id: 1,
      refresh_token: encrypt(refreshToken),
      connected_email: connectedEmail,
      updated_at: new Date().toISOString(),
    })
}

export async function getDriveFolderIds(): Promise<DriveFolderIds> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from("google_drive_tokens")
    .select("books_folder_id, audio_folder_id, video_folder_id")
    .eq("id", 1)
    .maybeSingle()

  return {
    books: data?.books_folder_id ?? null,
    audio: data?.audio_folder_id ?? null,
    video: data?.video_folder_id ?? null,
  }
}

export async function getDriveConnectionStatus() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from("google_drive_tokens")
    .select("connected_email, books_folder_id, audio_folder_id, video_folder_id")
    .eq("id", 1)
    .maybeSingle()

  return {
    connected: Boolean(data?.connected_email),
    email: data?.connected_email ?? null,
    folders: {
      books: data?.books_folder_id ?? null,
      audio: data?.audio_folder_id ?? null,
      video: data?.video_folder_id ?? null,
    } satisfies DriveFolderIds,
  }
}

export async function saveDriveFolderIds(folders: DriveFolderIds) {
  const supabase = createServiceClient()
  await supabase
    .from("google_drive_tokens")
    .update({
      books_folder_id: folders.books,
      audio_folder_id: folders.audio,
      video_folder_id: folders.video,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)
}
