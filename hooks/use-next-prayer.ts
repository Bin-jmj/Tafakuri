"use client"

import { useEffect, useState } from "react"
import { getNextPrayer, formatCountdown, formatCountdownHMS, ZERO_PRAYER_OFFSETS, type NextPrayer, type PrayerOffsets } from "@/lib/utils/prayer-times"

export interface NextPrayerInfo extends NextPrayer {
  countdown: string
  countdownHMS: string
}

/** Tracks the next daily prayer (EAT / Tanzania) and a live countdown to it. */
export function useNextPrayer(offsets: PrayerOffsets = ZERO_PRAYER_OFFSETS): NextPrayerInfo | null {
  const [info, setInfo] = useState<NextPrayerInfo | null>(null)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const next = getNextPrayer(now, offsets)
      const remaining = next.time.getTime() - now.getTime()
      setInfo({ ...next, countdown: formatCountdown(remaining), countdownHMS: formatCountdownHMS(remaining) })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offsets.fajr, offsets.dhuhr, offsets.asr, offsets.maghrib, offsets.isha])

  return info
}
