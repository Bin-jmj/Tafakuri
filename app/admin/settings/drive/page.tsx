import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, FolderOpen, HardDrive, Unplug, XCircle } from "lucide-react"
import { getDriveConnectionStatus } from "@/lib/drive/tokens"
import { disconnectDrive } from "./actions"

interface DriveSettingsPageProps {
  searchParams: Promise<{ connected?: string; error?: string }>
}

const DRIVE_ENV_VARS = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
  "DRIVE_TOKEN_ENCRYPTION_KEY",
] as const

export default async function DriveSettingsPage({ searchParams }: DriveSettingsPageProps) {
  const { connected, error } = await searchParams
  const status = await getDriveConnectionStatus()
  const missingEnvVars = DRIVE_ENV_VARS.filter((key) => !process.env[key])
  const configured = missingEnvVars.length === 0

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mipangilio ya Google Drive</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Unganisha akaunti ya Google Drive itakayohifadhi vitabu, sauti na video za Maktaba
        </p>
      </div>

      {connected === "1" && (
        <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-3 text-sm text-emerald-700 dark:text-emerald-400">
          Drive imeunganishwa kwa mafanikio.
        </div>
      )}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!configured && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 text-sm text-amber-700 dark:text-amber-400">
          Mazingira (environment variables) yafuatayo hayajawekwa kwenye <code>.env</code>:{" "}
          {missingEnvVars.map((key) => (
            <code key={key} className="mx-1">{key}</code>
          ))}
          . Tazama <code>docs/SETUP.md</code> kwenye mradi kwa maelekezo.
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Hali ya Muunganisho</CardTitle>
                <CardDescription>
                  {status.connected ? `Imeunganishwa: ${status.email}` : "Bado haijaunganishwa"}
                </CardDescription>
              </div>
            </div>
            {status.connected ? (
              <Badge variant="outline" className="gap-1.5 text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Imeunganishwa
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                <XCircle className="h-3.5 w-3.5" />
                Haijaunganishwa
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status.connected ? (
            <>
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    { label: "Vitabu", id: status.folders.books },
                    { label: "Sauti", id: status.folders.audio },
                    { label: "Video", id: status.folders.video },
                  ] as const
                ).map((folder) => (
                  <div key={folder.label} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/40 text-sm">
                    <FolderOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium">{folder.label}:</span>
                    <span className="text-muted-foreground truncate">{folder.id ?? "—"}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <form action={disconnectDrive}>
                <Button type="submit" variant="destructive" size="sm">
                  <Unplug className="h-4 w-4 mr-1.5" />
                  Tenganisha Drive
                </Button>
              </form>
            </>
          ) : (
            <a href="/api/auth/drive/connect">
              <Button disabled={!configured}>
                <HardDrive className="h-4 w-4 mr-1.5" />
                Unganisha Google Drive
              </Button>
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
