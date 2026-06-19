// Conversion to the Islamic (Hijri) calendar using the tabular/civil algorithm.
// This is an approximation (+/- 1 day) commonly used for "today's date" display -
// for exact moon-sighting dates, a local mosque announcement should be preferred.

import { getPrayerTimes } from "./prayer-times"

const TIMEZONE_OFFSET_MS = 3 * 3600 * 1000 // EAT (UTC+3), matches prayer-times.ts

const HIJRI_MONTHS_SW = [
  "Muharram",
  "Safar",
  "Rabiul Awwal",
  "Rabiul Thani",
  "Jumadal Awwal",
  "Jumadal Thani",
  "Rajab",
  "Shaaban",
  "Ramadhani",
  "Shawwal",
  "Dhul Qaadah",
  "Dhul Hijjah",
]

export interface HijriDate {
  day: number
  month: number // 1-12
  monthName: string
  year: number
}

const HIJRI_FORMATTER = new Intl.DateTimeFormat("en-US", {
  calendar: "islamic-civil",
  day: "numeric",
  month: "numeric",
  year: "numeric",
})

/**
 * `offsetDays` corrects for moon-sighting lag against the tabular/civil
 * calculation (admin-configurable, see rotation_settings.hijri_offset_days).
 */
export function gregorianToHijri(date: Date = new Date(), offsetDays = 0): HijriDate {
  // The Islamic day begins at Maghrib, not midnight - once today's Maghrib has
  // passed, the Hijri date should already show tomorrow's date.
  const eatNow = new Date(date.getTime() + TIMEZONE_OFFSET_MS)
  const maghrib = getPrayerTimes(eatNow.getUTCFullYear(), eatNow.getUTCMonth() + 1, eatNow.getUTCDate()).maghrib
  const effectiveDate = date.getTime() >= maghrib.getTime() ? new Date(date.getTime() + 24 * 3600 * 1000) : date
  const correctedDate = new Date(effectiveDate.getTime() + offsetDays * 24 * 3600 * 1000)

  const parts = HIJRI_FORMATTER.formatToParts(correctedDate)
  const day = Number(parts.find((p) => p.type === "day")?.value)
  const month = Number(parts.find((p) => p.type === "month")?.value)
  const year = Number(parts.find((p) => p.type === "year")?.value)

  return {
    day,
    month,
    monthName: HIJRI_MONTHS_SW[month - 1],
    year,
  }
}

export function formatHijriDate(date: Date = new Date(), offsetDays = 0): string {
  const h = gregorianToHijri(date, offsetDays)
  return `${h.day} ${h.monthName} ${h.year} AH`
}

/**
 * Reverse lookup: finds the next upcoming Gregorian date whose Hijri date
 * matches the given month/day, searching forward from `from`. Used to
 * suggest start/end dates for recurring occasions (Ramadhani, Idd Fitri,
 * Idd Adha) — admin can still nudge the result for moon-sighting.
 */
export function findNextHijriOccurrence(hijriMonth: number, hijriDay: number, offsetDays = 0, from: Date = new Date()): Date {
  for (let i = 0; i < 400; i++) {
    const candidate = new Date(from.getTime() + i * 24 * 3600 * 1000)
    const h = gregorianToHijri(candidate, offsetDays)
    if (h.month === hijriMonth && h.day === hijriDay) return candidate
  }
  return from
}

const GREGORIAN_WEEKDAYS_SW = [
  "Jumapili",
  "Jumatatu",
  "Jumanne",
  "Jumatano",
  "Alhamisi",
  "Ijumaa",
  "Jumamosi",
]

const GREGORIAN_MONTHS_SW = [
  "Januari",
  "Februari",
  "Machi",
  "Aprili",
  "Mei",
  "Juni",
  "Julai",
  "Agosti",
  "Septemba",
  "Oktoba",
  "Novemba",
  "Desemba",
]

export function formatGregorianDateSw(date: Date = new Date()): string {
  const weekday = GREGORIAN_WEEKDAYS_SW[date.getDay()]
  const month = GREGORIAN_MONTHS_SW[date.getMonth()]
  return `${weekday}, ${date.getDate()} ${month} ${date.getFullYear()}`
}
