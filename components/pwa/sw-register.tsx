"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Skip registration in dev: a SW caches dev-server chunk URLs, which
    // makes hot-reloaded CSS/JS look stale until caches are cleared.
    if (process.env.NODE_ENV === "development") return
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }
  }, [])

  return null
}
