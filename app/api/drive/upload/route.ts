import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import { getDriveClient } from "@/lib/drive/client"
import { ensureLibraryFolders, folderIdForType } from "@/lib/drive/folders"
import { Readable } from "stream"

export const runtime = "nodejs"

// POST /api/drive/upload — admin uploads a book/audio/video file.
// multipart/form-data: { file: File, type: "book" | "audio" | "video" }
export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get("file")
  const type = formData.get("type")

  if (!(file instanceof File) || typeof type !== "string" || !["book", "audio", "video"].includes(type)) {
    return NextResponse.json({ error: "Tafadhali chagua faili na aina sahihi" }, { status: 400 })
  }

  try {
    const drive = await getDriveClient()
    const folders = await ensureLibraryFolders(drive)
    const parentId = folderIdForType(folders, type as "book" | "audio" | "video")

    const buffer = Buffer.from(await file.arrayBuffer())

    const uploaded = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: parentId ? [parentId] : undefined,
      },
      media: {
        mimeType: file.type || "application/octet-stream",
        body: Readable.from(buffer),
      },
      fields: "id, name, mimeType, size",
    })

    const fileId = uploaded.data.id
    if (!fileId) throw new Error("Drive did not return a file id")

    // Make the file viewable via a shared link so the proxy route can stream it.
    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    })

    return NextResponse.json({
      driveFileId: fileId,
      mimeType: uploaded.data.mimeType,
      sizeBytes: uploaded.data.size ? Number(uploaded.data.size) : buffer.byteLength,
      name: uploaded.data.name,
    })
  } catch (error) {
    console.error("[drive-upload] failed", error)
    const message = error instanceof Error ? error.message : "Imeshindikana kupakia faili"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
