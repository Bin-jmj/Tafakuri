"use client"

import { useEffect, useState } from "react"
import { getNextPrayer, formatCountdown, formatCountdownHMS, type NextPrayer } from "@/lib/utils/prayer-times"

export interface NextPrayerInfo extends NextPrayer {
  countdown: string
  countdownHMS: string
}

/** Tracks the next daily prayer (EAT / Tanzania) and a live countdown to it. */
export function useNextPrayer(): NextPrayerInfo | null {
  const [info, setInfo] = useState<NextPrayerInfo | null>(null)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const next = getNextPrayer(now)
      const remaining = next.time.getTime() - now.getTime()
      setInfo({ ...next, countdown: formatCountdown(remaining), countdownHMS: formatCountdownHMS(remaining) })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return info
}
