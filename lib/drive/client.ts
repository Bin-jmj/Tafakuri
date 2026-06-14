import { google } from "googleapis"
import { getDriveRefreshToken } from "./tokens"

export const DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/userinfo.email",
]

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  )
}

/** URL the admin visits once to grant Tafakuri access to their Drive. */
export function getDriveAuthUrl(state?: string) {
  const client = getOAuth2Client()
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: DRIVE_SCOPES,
    state,
  })
}

/**
 * Returns a Drive API client authenticated as the admin via the stored
 * refresh token. Throws if Drive has not been connected yet.
 */
export async function getDriveClient() {
  const refreshToken = await getDriveRefreshToken()
  if (!refreshToken) {
    throw new Error("Google Drive is not connected. Visit /admin/settings/drive to connect it.")
  }

  const auth = getOAuth2Client()
  auth.setCredentials({ refresh_token: refreshToken })

  return google.drive({ version: "v3", auth })
}
