"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ANON_SCOPE, bookmarkRecordKey, getDB } from "@/lib/offline/db"
import { enqueueOutbox, flushOutbox, pullUserContent } from "@/lib/offline/sync"

export type ReadingContentType = "book" | "article"

export interface ReadingProgressData {
  progressPercent: number
  currentPage?: number
  totalPages?: number
}

/**
 * Offline-first reading progress. Writes land in IndexedDB immediately
 * (works logged-out and offline) and queue to the outbox for Supabase
 * sync when signed in and online.
 */
export function useReadingProgress(type: ReadingContentType, id: string) {
  const [supabase] = useState(() => createClient())
  const [progress, setProgress] = useState<ReadingProgressData | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const scope = userId ?? ANON_SCOPE
  const recordKey = bookmarkRecordKey(scope, type, id)

  useEffect(() => {
    let active = true
    setLoaded(false)
    setProgress(null)
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        const uid = data.user?.id ?? null
        if (!active) return
        setUserId(uid)

        const currentScope = uid ?? ANON_SCOPE
        const db = await getDB()
        const local = await db.get("reading_progress", bookmarkRecordKey(currentScope, type, id))
        if (active && local) {
          setProgress({
            progressPercent: local.progressPercent,
            currentPage: local.currentPage,
            totalPages: local.totalPages,
          })
        }
        if (active) setLoaded(true)

        if (uid && navigator.onLine) {
          await pullUserContent(uid)
          const fresh = await db.get("reading_progress", bookmarkRecordKey(uid, type, id))
          if (active && fresh) {
            setProgress({
              progressPercent: fresh.progressPercent,
              currentPage: fresh.currentPage,
              totalPages: fresh.totalPages,
            })
          }
        }
      } catch {
        // No IndexedDB - degrade to local-only in-memory state.
        if (active) setLoaded(true)
      }
    })()
    return () => {
      active = false
    }
  }, [supabase, type, id])

  const saveProgress = useCallback(
    async (data: ReadingProgressData) => {
      try {
        const db = await getDB()
        await db.put("reading_progress", {
          key: recordKey,
          userId: scope,
          contentType: type,
          contentId: id,
          progressPercent: data.progressPercent,
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          synced: false,
          updatedAt: Date.now(),
        })
        await enqueueOutbox(db, "reading_progress", "upsert", {
          content_type: type,
          content_id: id,
          progress_percent: data.progressPercent,
          current_page: data.currentPage ?? null,
          total_pages: data.totalPages ?? null,
        })
        setProgress(data)
        if (userId && navigator.onLine) {
          await flushOutbox(userId)
        }
      } catch {
        // Storage unavailable - keep the session's progress in memory only.
        setProgress(data)
      }
    },
    [recordKey, scope, type, id, userId],
  )

  return { progress, loaded, signedIn: !!userId, saveProgress }
}
