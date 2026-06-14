"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export type ReadingContentType = "book" | "article"

export interface ReadingProgressData {
  progressPercent: number
  currentPage?: number
  totalPages?: number
}

export function useReadingProgress(type: ReadingContentType, id: string) {
  const [supabase] = useState(() => createClient())
  const [progress, setProgress] = useState<ReadingProgressData | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!active) return
      setUserId(user?.id ?? null)
      if (user) {
        const { data: row } = await supabase
          .from("reading_progress")
          .select("progress_percent, current_page, total_pages")
          .eq("user_id", user.id)
          .eq("content_type", type)
          .eq("content_id", id)
          .maybeSingle()
        if (active && row) {
          setProgress({
            progressPercent: row.progress_percent,
            currentPage: row.current_page ?? undefined,
            totalPages: row.total_pages ?? undefined,
          })
        }
      }
      if (active) setLoaded(true)
    })()
    return () => {
      active = false
    }
  }, [supabase, type, id])

  const saveProgress = useCallback(
    async (data: ReadingProgressData) => {
      if (!userId) return
      await supabase.from("reading_progress").upsert(
        {
          user_id: userId,
          content_type: type,
          content_id: id,
          progress_percent: data.progressPercent,
          current_page: data.currentPage ?? null,
          total_pages: data.totalPages ?? null,
        },
        { onConflict: "user_id,content_type,content_id" },
      )
    },
    [supabase, type, id, userId],
  )

  return { progress, loaded, signedIn: !!userId, saveProgress }
}
