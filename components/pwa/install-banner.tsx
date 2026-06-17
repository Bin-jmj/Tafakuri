"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, X, BellRing, Share2 } from "lucide-react"
import { usePwaInstall } from "@/hooks/use-pwa-install"

const DISMISSED_KEY = "pwa_banner_dismissed_until"
const DISMISS_DAYS = 30

function wasDismissed(): boolean {
  try {
    const val = localStorage.getItem(DISMISSED_KEY)
    if (!val) return false
    return Date.now() < Number(val)
  } catch {
    return false
  }
}

function dismissFor30Days() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now() + DISMISS_DAYS * 86_400_000))
  } catch {}
}

export function InstallBanner() {
  const { installState, install } = usePwaInstall()
  const [visible, setVisible] = useState(false)

  // Only reveal after mount so localStorage is available and hydration is stable
  useEffect(() => {
    if (installState === "installable" || installState === "ios") {
      setVisible(!wasDismissed())
    }
  }, [installState])

  if (!visible) return null

  const handleDismiss = () => {
    dismissFor30Days()
    setVisible(false)
  }

  const handleInstall = async () => {
    const outcome = await install()
    if (outcome === "accepted") {
      setVisible(false)
    }
  }

  const isIOS = installState === "ios"

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <Card className="p-4 shadow-xl border-primary/20 bg-background">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary flex-shrink-0">
            <BellRing className="h-5 w-5 text-primary-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight">Sakinisha Tafakuri</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {isIOS
                ? "Bonyeza kitufe cha kushiriki (↑) kwenye Safari, kisha chagua \"Ongeza kwenye skrini ya nyumbani\"."
                : "Sakinisha programu kwenye kifaa chako ili baadaye upate arifa za wakati wa sala na habari mpya."}
            </p>

            <div className="flex items-center gap-2 mt-3">
              {isIOS ? (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={handleDismiss}>
                  <Share2 className="h-3 w-3" />
                  Nimeelewa
                </Button>
              ) : (
                <Button size="sm" className="h-7 text-xs gap-1.5" onClick={handleInstall}>
                  <Download className="h-3 w-3" />
                  Sakinisha Sasa
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground"
                onClick={handleDismiss}
              >
                Baadaye
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-0.5 -mr-0.5 flex-shrink-0 text-muted-foreground"
            onClick={handleDismiss}
            aria-label="Funga"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
