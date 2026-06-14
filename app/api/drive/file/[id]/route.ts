import { NextResponse } from "next/server"
import { getDriveClient } from "@/lib/drive/client"
import { createServiceClient } from "@/lib/supabase/server"
import { withExtension } from "@/lib/utils/mime"

export const runtime = "nodejs"

// GET /api/drive/file/[id] — streams a book/audio/video file from Drive to
// the browser, so raw Drive links are never exposed and downloads can be
// counted / gated on `is_available`.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = createServiceClient()
  const { data: item } = await supabase
    .from("media_items")
    .select("id, title, drive_file_id, drive_mime_type, is_available, download_count")
    .eq("drive_file_id", id)
    .maybeSingle()

  if (!item || !item.is_available) {
    return NextResponse.json({ error: "Faili haipatikani" }, { status: 404 })
  }

  try {
    const drive = await getDriveClient()
    const driveRes = await drive.files.get(
      { fileId: id, alt: "media" },
      { responseType: "stream" },
    )

    await supabase
      .from("media_items")
      .update({ download_count: item.download_count + 1 })
      .eq("id", item.id)

    const filename = withExtension(item.title, item.drive_mime_type)

    return new NextResponse(driveRes.data as unknown as ReadableStream, {
      headers: {
        "Content-Type": item.drive_mime_type ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (error) {
    console.error("[drive-file] failed", error)
    return NextResponse.json({ error: "Imeshindikana kupakua faili" }, { status: 502 })
  }
}
