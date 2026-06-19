// Admin-configurable rotation time slots for the Adhkar widget and the
// "Aya ya Leo" / "Hadith ya Leo" cards. Times are "HH:MM" or "HH:MM:SS"
// strings (as returned by Postgres `time` columns).

import type { PrayerOffsets } from "./prayer-times"

export interface RotationSettings {
  adhkarAsubuhiStart: string
  adhkarJioniStart: string
  adhkarAsubuhiRotateSeconds: number
  adhkarJioniRotateSeconds: number
  sunriseTime: string
  sunsetTime: string
  hijriOffsetDays: number
  prayerOffsetFajr: number
  prayerOffsetDhuhr: number
  prayerOffsetAsr: number
  prayerOffsetMaghrib: number
  prayerOffsetIsha: number
  contentFajrStart: string
  contentDhuhrStart: string
  contentAsrStart: string
  contentMaghribStart: string
  contentIshaStart: string
}

export const DEFAULT_ROTATION_SETTINGS: RotationSettings = {
  adhkarAsubuhiStart: "05:00",
  adhkarJioniStart: "12:00",
  adhkarAsubuhiRotateSeconds: 30,
  adhkarJioniRotateSeconds: 30,
  sunriseTime: "06:00",
  sunsetTime: "18:00",
  hijriOffsetDays: 0,
  prayerOffsetFajr: 0,
  prayerOffsetDhuhr: 0,
  prayerOffsetAsr: 0,
  prayerOffsetMaghrib: 0,
  prayerOffsetIsha: 0,
  contentFajrStart: "05:00",
  contentDhuhrStart: "12:30",
  contentAsrStart: "15:45",
  contentMaghribStart: "18:30",
  contentIshaStart: "19:45",
}

/** Extracts the PrayerOffsets shape that lib/utils/prayer-times.ts expects. */
export function getPrayerOffsets(settings: RotationSettings): PrayerOffsets {
  return {
    fajr: settings.prayerOffsetFajr,
    dhuhr: settings.prayerOffsetDhuhr,
    asr: settings.prayerOffsetAsr,
    maghrib: settings.prayerOffsetMaghrib,
    isha: settings.prayerOffsetIsha,
  }
}

export const CONTENT_SLOT_LABELS = ["Alfajiri", "Adhuhuri", "Alasiri", "Magharibi", "Isha"] as const

const TIMEZONE_OFFSET_MS = 3 * 3600 * 1000 // EAT (UTC+3) — matches lib/utils/prayer-times.ts

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + (m || 0)
}

// All slot boundaries are entered by the admin as Tanzania (EAT) wall-clock
// times, so "now" must always be read in EAT too — regardless of the
// server's configured timezone, or (for getAdhkarSlot, which also runs
// client-side) the viewer's own browser timezone.
function nowMinutesEAT(date: Date): number {
  const eat = new Date(date.getTime() + TIMEZONE_OFFSET_MS)
  return eat.getUTCHours() * 60 + eat.getUTCMinutes()
}

function contentSlotStarts(settings: RotationSettings): number[] {
  return [
    settings.contentFajrStart,
    settings.contentDhuhrStart,
    settings.contentAsrStart,
    settings.contentMaghribStart,
    settings.contentIshaStart,
  ].map(timeToMinutes)
}

/** Returns which of the 5 prayer-time slots (0=Alfajiri..4=Isha) `now` falls in. */
export function getContentSlotIndex(settings: RotationSettings, now: Date = new Date()): number {
  const nowMin = nowMinutesEAT(now)
  const starts = contentSlotStarts(settings)

  let slot = starts.length - 1
  for (let i = 0; i < starts.length; i++) {
    if (nowMin >= starts[i]) slot = i
  }
  // Before the first slot starts (e.g. before Fajr) - still in yesterday's last slot
  if (nowMin < starts[0]) slot = starts.length - 1
  return slot
}

/** Returns the Adhkar widget's morning/evening slot based on the admin-configured boundaries. */
export function getAdhkarSlot(settings: RotationSettings, now: Date = new Date()): "asubuhi" | "jioni" {
  const nowMin = nowMinutesEAT(now)
  const asubuhi = timeToMinutes(settings.adhkarAsubuhiStart)
  const jioni = timeToMinutes(settings.adhkarJioniStart)

  if (asubuhi <= jioni) {
    return nowMin >= asubuhi && nowMin < jioni ? "asubuhi" : "jioni"
  }
  return nowMin >= jioni && nowMin < asubuhi ? "jioni" : "asubuhi"
}

/** Returns the configured rotation duration (seconds) for the given Adhkar slot. */
export function getAdhkarRotateSeconds(settings: RotationSettings, slot: "asubuhi" | "jioni"): number {
  return slot === "asubuhi" ? settings.adhkarAsubuhiRotateSeconds : settings.adhkarJioniRotateSeconds
}
