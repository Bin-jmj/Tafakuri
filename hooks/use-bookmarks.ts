"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export type BookmarkContentType = "quran_verse" | "hadith" | "dua" | "adhkar" | "article" | "media"

export function useBookmarks() {
  const [supabase] = useState(() => createClient())
  const { toast } = useToast()
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!active) return
      setUserId(user?.id ?? null)
      if (user) {
        const { data: rows } = await supabase
          .from("bookmarks")
          .select("content_type, content_id")
          .eq("user_id", user.id)
        if (active && rows) {
          setBookmarks(new Set(rows.map((r) => `${r.content_type}:${r.content_id}`)))
        }
      }
      if (active) setLoaded(true)
    })()
    return () => {
      active = false
    }
  }, [supabase])

  const isBookmarked = useCallback(
    (type: BookmarkContentType, id: string) => bookmarks.has(`${type}:${id}`),
    [bookmarks],
  )

  const toggleBookmark = useCallback(
    async (type: BookmarkContentType, id: string): Promise<boolean> => {
      if (!userId) {
        toast({
          title: "Tafadhali ingia",
          description: "Unahitaji kuingia kwenye akaunti yako kuweka alama.",
          variant: "destructive",
        })
        return false
      }

      const key = `${type}:${id}`
      if (bookmarks.has(key)) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", userId)
          .eq("content_type", type)
          .eq("content_id", id)
        if (error) return false
        setBookmarks((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      } else {
        const { error } = await supabase
          .from("bookmarks")
          .insert({ user_id: userId, content_type: type, content_id: id })
        if (error) return false
        setBookmarks((prev) => new Set(prev).add(key))
      }
      return true
    },
    [bookmarks, userId, supabase, toast],
  )

  return { isBookmarked, toggleBookmark, loaded, signedIn: !!userId }
}
