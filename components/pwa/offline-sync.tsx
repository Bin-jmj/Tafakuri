"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { flushOutbox, mergeAnonBookmarks, pullUserContent } from "@/lib/offline/sync"

/**
 * Runs the offline sync loop: promotes anonymous bookmarks into the
 * account on sign-in, pulls the user's server data into IndexedDB, and
 * replays queued (outbox) mutations whenever the app loads, reconnects,
 * or the auth session changes.
 */
export function OfflineSync() {
  useEffect(() => {
    const supabase = createClient()
    let active = true
    let running = false

    async function run() {
      if (!active || running || typeof navigator === "undefined") return
      running = true
      try {
        const { data } = await supabase.auth.getUser()
        const userId = data.user?.id
        if (!userId) return
        await mergeAnonBookmarks(userId)
        if (navigator.onLine) {
          await pullUserContent(userId)
          await flushOutbox(userId)
        }
      } catch {
        // Offline or storage unavailable - retried on the next trigger.
      } finally {
        running = false
      }
    }

    function handleOnline() {
      void run()
    }

    void run()
    window.addEventListener("online", handleOnline)
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      void run()
    })

    return () => {
      active = false
      window.removeEventListener("online", handleOnline)
      authListener.subscription.unsubscribe()
    }
  }, [])

  return null
}
