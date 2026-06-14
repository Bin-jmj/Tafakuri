import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import { getDriveAuthUrl } from "@/lib/drive/client"

// GET /api/auth/drive/connect — admin clicks "Connect Google Drive" and is
// redirected to Google's consent screen.
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.redirect(getDriveAuthUrl())
}
