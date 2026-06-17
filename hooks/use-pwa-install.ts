"use client"

import { useEffect, useState, useCallback } from "react"

// BeforeInstallPromptEvent is not in the standard TS lib yet
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export type PwaInstallState =
  | "detecting"   // still waiting to know
  | "installed"   // running as installed PWA (standalone)
  | "installable" // browser says it can be installed
  | "ios"         // iOS Safari — manual share-sheet flow required
  | "unsupported" // browser does not support PWA install

export interface UsePwaInstall {
  installState: PwaInstallState
  /** Call this on Android/desktop — triggers the native install prompt */
  install: () => Promise<"accepted" | "dismissed" | "unavailable">
}

export function usePwaInstall(): UsePwaInstall {
  const [installState, setInstallState] = useState<PwaInstallState>("detecting")
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Already running as an installed PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) {
      setInstallState("installed")
      return
    }

    // iOS Safari cannot fire beforeinstallprompt — user must use the share sheet
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
    if (isIOS) {
      setInstallState("ios")
      return
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setInstallState("installable")
    }

    const handleAppInstalled = () => {
      setInstallState("installed")
      setPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    window.addEventListener("appinstalled", handleAppInstalled)

    // If the event never fires, the browser doesn't support PWA install
    const timer = setTimeout(() => {
      setInstallState((prev) => (prev === "detecting" ? "unsupported" : prev))
    }, 3000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleAppInstalled)
      clearTimeout(timer)
    }
  }, [])

  const install = useCallback(async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    if (!prompt) return "unavailable"
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    setPrompt(null)
    return outcome
  }, [prompt])

  return { installState, install }
}
