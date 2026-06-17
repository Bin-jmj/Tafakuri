"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + (m || 0)
}

function resolveTheme(sunrise: string, sunset: string): "light" | "dark" {
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const sunriseMin = timeToMinutes(sunrise)
  const sunsetMin = timeToMinutes(sunset)
  return nowMin >= sunriseMin && nowMin < sunsetMin ? "light" : "dark"
}

interface AutoThemeProps {
  sunrise: string
  sunset: string
}

// Sets theme automatically based on sunrise/sunset on first load.
// After that, the user's manual toggle takes over.
// Re-applies at actual sunrise/sunset transitions while the app is open.
export function AutoTheme({ sunrise, sunset }: AutoThemeProps) {
  const { setTheme } = useTheme()

  useEffect(() => {
    const apply = () => setTheme(resolveTheme(sunrise, sunset))

    // Apply immediately on mount
    apply()

    // Calculate ms until the next sunrise or sunset boundary and re-apply then
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
    const sunriseMin = timeToMinutes(sunrise)
    const sunsetMin = timeToMinutes(sunset)

    const minutesUntilNext = (() => {
      const FULL_DAY = 24 * 60
      const candidates = [sunriseMin, sunsetMin]
        .map((t) => (t > nowMin ? t - nowMin : t + FULL_DAY - nowMin))
      return Math.min(...candidates)
    })()

    // Fire exactly at the transition boundary
    const timeout = setTimeout(apply, minutesUntilNext * 60_000)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sunrise, sunset])

  return null
}
