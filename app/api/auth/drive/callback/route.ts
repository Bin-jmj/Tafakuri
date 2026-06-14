import { NextResponse } from "next/server"
import { google } from "googleapis"
import { requireAdmin } from "@/lib/auth/require-admin"
import { getOAuth2Client } from "@/lib/drive/client"
import { ensureLibraryFolders } from "@/lib/drive/folders"
import { saveDriveRefreshToken } from "@/lib/drive/tokens"

// GET /api/auth/drive/callback — Google redirects here after the admin
// grants access. Exchanges the code for tokens and persists the refresh
// token (encrypted) so future requests never need the admin to be online.
export async function GET(request: Request) {
  const admin = await requireAdmin()
  const { searchParams, origin } = new URL(request.url)
  const settingsUrl = `${origin}/admin/settings/drive`

  if (!admin) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  const code = searchParams.get("code")
  if (!code) {
    return NextResponse.redirect(`${settingsUrl}?error=Hakuna%20msimbo%20kutoka%20Google`)
  }

  try {
    const client = getOAuth2Client()
    const { tokens } = await client.getToken(code)

    if (!tokens.refresh_token) {
      // Google only returns a refresh_token on the first consent. If the
      // admin re-connects, they must revoke access at
      // myaccount.google.com/permissions first.
      return NextResponse.redirect(
        `${settingsUrl}?error=${encodeURIComponent(
          "Google haikutoa refresh token. Toa ruhusa ya programu hii kwenye myaccount.google.com/permissions kisha jaribu tena.",
        )}`,
      )
    }

    client.setCredentials(tokens)
    const oauth2 = google.oauth2({ version: "v2", auth: client })
    const { data: userInfo } = await oauth2.userinfo.get()

    await saveDriveRefreshToken(tokens.refresh_token, userInfo.email ?? "unknown")

    const drive = google.drive({ version: "v3", auth: client })
    await ensureLibraryFolders(drive)

    return NextResponse.redirect(`${settingsUrl}?connected=1`)
  } catch (error) {
    console.error("[drive-connect] failed", error)
    return NextResponse.redirect(`${settingsUrl}?error=Imeshindikana%20kuunganisha%20Drive`)
  }
}
