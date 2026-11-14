"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Database, Download, HardDrive } from "lucide-react"
import { getDB } from "@/lib/offline/db"

interface OfflineStats {
  quranCount: number
  hadithCount: number
  duaCount: number
  adhkarCount: number
  syncedAt: number | null
  /** navigator.storage.estimate() results, when the browser supports them. */
  usageBytes: number | null
  quotaBytes: number | null
  downloadedBooks: number
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

/**
 * Shows what the app keeps on the device for offline use: the cached
 * content bundle (per store, with its last sync time), the number of
 * downloaded book files (Cache Storage), and the device storage estimate
 * when the browser exposes one. Everything degrades gracefully - a row
 * simply hides when its data source is unavailable.
 */
export function OfflineStorageCard() {
  const [stats, setStats] = useState<OfflineStats | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const db = await getDB()
        const [quranCount, hadithCount, duaCount, adhkarCount, meta] = await Promise.all([
          db.count("quran"),
          db.count("hadith"),
          db.count("dua"),
          db.count("adhkar"),
          db.get("content_meta", "core"),
        ])

        let usageBytes: number | null = null
        let quotaBytes: number | null = null
        try {
          if (navigator.storage?.estimate) {
            const est = await navigator.storage.estimate()
            usageBytes = est.usage ?? null
            quotaBytes = est.quota ?? null
          }
        } catch {
          // Storage estimate unsupported - row hidden.
        }

        let downloadedBooks = 0
        try {
          if (typeof caches !== "undefined") {
            const cache = await caches.open("tafakuri-books")
            const keys = await cache.keys()
            downloadedBooks = keys.length
          }
        } catch {
          // Cache Storage unavailable - row hidden.
        }

        if (active) {
          setStats({
            quranCount,
            hadithCount,
            duaCount,
            adhkarCount,
            syncedAt: meta?.syncedAt ?? null,
            usageBytes,
            quotaBytes,
            downloadedBooks,
          })
        }
      } catch {
        // No IndexedDB - nothing to show.
        if (active) setStats({
          quranCount: 0,
          hadithCount: 0,
          duaCount: 0,
          adhkarCount: 0,
          syncedAt: null,
          usageBytes: null,
          quotaBytes: null,
          downloadedBooks: 0,
        })
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-primary" aria-hidden />
          Data za Nje ya Mtandao
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!stats ? (
          <div className="space-y-2" aria-busy="true">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <dl className="space-y-2 text-sm">
            {(stats.quranCount > 0 || stats.hadithCount > 0 || stats.duaCount > 0 || stats.adhkarCount > 0) && (
              <div className="flex items-start justify-between gap-4">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Database className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Maudhui yaliyohifadhiwa
                </dt>
                <dd className="text-right text-xs text-muted-foreground">
                  {stats.quranCount.toLocaleString()} aya · {stats.hadithCount} hadith ·{" "}
                  {stats.duaCount} dua · {stats.adhkarCount} adhkar
                  {stats.syncedAt ? (
                    <> · ilisasishwa {new Date(stats.syncedAt).toLocaleDateString("sw-TZ")}</>
                  ) : null}
                </dd>
              </div>
            )}
            {stats.downloadedBooks > 0 && (
              <div className="flex items-start justify-between gap-4">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Download className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Vitabu vilivyopakuliwa
                </dt>
                <dd className="text-xs text-muted-foreground">{stats.downloadedBooks}</dd>
              </div>
            )}
            {stats.usageBytes != null && (
              <div className="flex items-start justify-between gap-4">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <HardDrive className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Nafasi inayotumiwa
                </dt>
                <dd className="text-xs text-muted-foreground">
                  {formatBytes(stats.usageBytes)}
                  {stats.quotaBytes != null ? ` / ${formatBytes(stats.quotaBytes)}` : ""}
                </dd>
              </div>
            )}
            {!stats.syncedAt && stats.quranCount === 0 && (
              <p className="text-xs text-muted-foreground">
                Hakuna data zilizohifadhiwa bado. Zitasasishwa unapokuwa mtandaoni.
              </p>
            )}
          </dl>
        )}
      </CardContent>
    </Card>
  )
}
