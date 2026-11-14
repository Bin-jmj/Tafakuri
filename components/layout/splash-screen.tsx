"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"

const SESSION_KEY = "tafakuri_splash_shown"

/**
 * Premium startup experience: Tafakuri logo with a gentle pulse, the app
 * name, and a small loading indicator. It appears on the first load of a
 * session and fades out as soon as the app shell and fonts are ready —
 * no artificial timers stretch the wait (only a 400ms minimum so the
 * animation is actually perceptible). Subsequent in-session navigations
 * skip it entirely.
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [faded, setFaded] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        setFaded(true)
        setVisible(false)
        return
      }
      sessionStorage.setItem(SESSION_KEY, "1")
    } catch {
      // Storage unavailable (private mode) - just show it once per load.
    }

    let cancelled = false
    const start = Date.now()
    const minDisplay = new Promise((resolve) => setTimeout(resolve, 400))
    const fontsReady =
      typeof document !== "undefined" && "fonts" in document ? document.fonts.ready : Promise.resolve()

    Promise.all([minDisplay, fontsReady]).then(() => {
      if (cancelled) return
      setVisible(false)
      // Keep the element mounted until the fade completes, then drop it.
      setTimeout(() => !cancelled && setFaded(true), 300)
    })

    return () => {
      cancelled = true
    }
  }, [])

  if (faded) return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-300 ease-out ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-primary shadow-lg ring-1 ring-primary/20">
        <Image
          src="/logo.png"
          alt=""
          width={96}
          height={96}
          className="h-full w-full object-contain motion-safe:animate-[splash-pulse_1.6s_ease-in-out_infinite]"
          priority
        />
      </div>
      <p className="mt-5 text-2xl font-bold tracking-tight">Tafakuri</p>
      <p className="mt-1 text-sm text-muted-foreground">Maarifa ya Kiislamu kwa Kiswahili</p>
      <Loader2 className="mt-6 h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
    </div>
  )
}
