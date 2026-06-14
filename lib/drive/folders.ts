import type { drive_v3 } from "googleapis"
import { getDriveFolderIds, saveDriveFolderIds } from "./tokens"
import type { DriveFolderIds } from "./tokens"

const ROOT_FOLDER_NAME = "Tafakuri"
const SUBFOLDERS: Record<keyof DriveFolderIds, string> = {
  books: "Books",
  audio: "Audio",
  video: "Video",
}

async function findOrCreateFolder(drive: drive_v3.Drive, name: string, parentId?: string) {
  const parentQuery = parentId ? ` and '${parentId}' in parents` : ""
  const res = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false${parentQuery}`,
    fields: "files(id, name)",
    spaces: "drive",
  })

  const existing = res.data.files?.[0]
  if (existing?.id) return existing.id

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      ...(parentId ? { parents: [parentId] } : {}),
    },
    fields: "id",
  })

  if (!created.data.id) throw new Error(`Failed to create Drive folder "${name}"`)
  return created.data.id
}

/**
 * Ensures Tafakuri/Books, Tafakuri/Audio and Tafakuri/Video exist in the
 * connected Drive account and caches their ids in google_drive_tokens.
 */
export async function ensureLibraryFolders(drive: drive_v3.Drive): Promise<DriveFolderIds> {
  const cached = await getDriveFolderIds()
  if (cached.books && cached.audio && cached.video) return cached

  const rootId = await findOrCreateFolder(drive, ROOT_FOLDER_NAME)
  const folders: DriveFolderIds = {
    books: await findOrCreateFolder(drive, SUBFOLDERS.books, rootId),
    audio: await findOrCreateFolder(drive, SUBFOLDERS.audio, rootId),
    video: await findOrCreateFolder(drive, SUBFOLDERS.video, rootId),
  }

  await saveDriveFolderIds(folders)
  return folders
}

export function folderIdForType(folders: DriveFolderIds, type: "book" | "audio" | "video") {
  return type === "book" ? folders.books : type === "audio" ? folders.audio : folders.video
}
