"use client"

import { useEffect } from "react"

const VERSION_KEY = "tafakuri_content_version"

/**
 * Silently keeps the offline precache of Qur'an/Hadith/Dua/Adhkar content
 * fresh. On each load, compares /api/content-version against the version we
 * last finished precaching (stored in localStorage) and asks the service
 * worker to re-fetch everything when admin has added, edited, or removed
 * any of that content since. No-op when there's no service worker yet, or
 * when offline (silently retries on the next online visit).
 */
export function ContentPrecache() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    let active = true

    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "PRECACHE_DONE" && typeof event.data.version !== "undefined") {
        localStorage.setItem(VERSION_KEY, String(event.data.version))
      }
    }

    async function checkAndPrecache() {
      try {
        const res = await fetch("/api/content-version")
        if (!res.ok || !active) return
        const { version } = await res.json()
        if (localStorage.getItem(VERSION_KEY) === String(version)) return

        const registration = await navigator.serviceWorker.ready
        if (!active || !registration.active) return
        registration.active.postMessage({ type: "PRECACHE_CONTENT" })
      } catch {
        // Offline, or SW not ready yet - skip silently, retried on next load.
      }
    }

    navigator.serviceWorker.addEventListener("message", handleMessage)
    // Delay so this background sweep never competes with whatever the user
    // is doing in the first moments after opening the app (e.g. reading or
    // downloading a book) for a connection slot.
    const timer = setTimeout(checkAndPrecache, 5000)

    return () => {
      active = false
      clearTimeout(timer)
      navigator.serviceWorker.removeEventListener("message", handleMessage)
    }
  }, [])

  return null
}
