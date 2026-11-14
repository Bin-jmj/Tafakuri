"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  ANON_SCOPE,
  bookmarkRecordKey,
  getDB,
  type BookmarkContentType,
} from "@/lib/offline/db"
import { enqueueOutbox, flushOutbox, pullUserContent } from "@/lib/offline/sync"

export type { BookmarkContentType } from "@/lib/offline/db"

/**
 * Offline-first bookmarks. Local truth lives in IndexedDB; every mutation
 * is queued in the outbox and replayed to Supabase when online and signed
 * in. Anonymous bookmarks stay local and are merged into the account on
 * sign-in (see lib/offline/sync.ts#mergeAnonBookmarks).
 */
export function useBookmarks() {
  const [supabase] = useState(() => createClient())
  const { toast } = useToast()
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const scope = userId ?? ANON_SCOPE

  const reload = useCallback(async (scopeValue: string) => {
    const db = await getDB()
    const records = await db.getAllFromIndex("bookmarks", "by_user", scopeValue)
    return new Set(records.filter((r) => !r.deleted).map((r) => `${r.contentType}:${r.contentId}`))
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        const uid = data.user?.id ?? null
        if (!active) return
        setUserId(uid)
        setBookmarks(await reload(uid ?? ANON_SCOPE))
        if (uid && navigator.onLine) {
          // Refresh from the server in the background; local unsynced
          // records win until they are flushed (see lib/offline/sync.ts).
          await pullUserContent(uid)
          if (active) setBookmarks(await reload(uid))
          void flushOutbox(uid)
        }
      } catch {
        // No IndexedDB (private mode / unsupported) - empty local state.
      }
      if (active) setLoaded(true)
    })()
    return () => {
      active = false
    }
  }, [supabase, reload])

  const isBookmarked = useCallback(
    (type: BookmarkContentType, id: string) => bookmarks.has(`${type}:${id}`),
    [bookmarks],
  )

  const toggleBookmark = useCallback(
    async (type: BookmarkContentType, id: string): Promise<boolean> => {
      let next: Set<string>
      try {
        const db = await getDB()
        const key = `${type}:${id}`
        const recordKey = bookmarkRecordKey(scope, type, id)
        const existing = await db.get("bookmarks", recordKey)
        const removing = !!existing && !existing.deleted

        await db.put("bookmarks", {
          key: recordKey,
          userId: scope,
          contentType: type,
          contentId: id,
          synced: false,
          deleted: removing,
          updatedAt: Date.now(),
        })
        await enqueueOutbox(db, "bookmark", removing ? "delete" : "upsert", {
          content_type: type,
          content_id: id,
        })

        next = new Set(bookmarks)
        if (removing) next.delete(key)
        else next.add(key)
        setBookmarks(next)

        if (userId && navigator.onLine) {
          await flushOutbox(userId)
          setBookmarks(await reload(scope))
        }
        return true
      } catch {
        toast({
          title: "Imeshindikana kuhifadhi",
          description: "Hifadhi ya kifaa haiwapatikani kwa sasa.",
          variant: "destructive",
        })
        return false
      }
    },
    [bookmarks, scope, userId, reload, toast],
  )

  return { isBookmarked, toggleBookmark, bookmarks, loaded, signedIn: !!userId }
}
