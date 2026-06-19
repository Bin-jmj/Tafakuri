// Prayer time calculation for Tanzania (Dar es Salaam, EAT / UTC+3).
// Uses the standard astronomical (sun-angle) method - Muslim World League
// angles (Fajr 18deg, Isha 17deg) with the Shafi Asr factor. Accurate to
// within a minute or two, which is sufficient for a "next prayer" countdown.

const LAT = -6.8235 // Dar es Salaam
const LNG = 39.2695
const TIMEZONE = 3 // East Africa Time (UTC+3), no DST

const FAJR_ANGLE = 18
const ISHA_ANGLE = 17
const ASR_FACTOR = 1 // Shafi

const D2R = Math.PI / 180
const R2D = 180 / Math.PI

const sinD = (d: number) => Math.sin(d * D2R)
const cosD = (d: number) => Math.cos(d * D2R)
const tanD = (d: number) => Math.tan(d * D2R)
const arcsinD = (x: number) => Math.asin(x) * R2D
const arccosD = (x: number) => Math.acos(x) * R2D
const arccotD = (x: number) => Math.atan(1 / x) * R2D
const arctan2D = (y: number, x: number) => Math.atan2(y, x) * R2D

function fix(a: number, b: number): number {
  const r = a - b * Math.floor(a / b)
  return r < 0 ? r + b : r
}
const fixAngle = (a: number) => fix(a, 360)
const fixHour = (a: number) => fix(a, 24)

function julianDate(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1
    month += 12
  }
  const A = Math.floor(year / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5
}

function sunPosition(jd: number): { decl: number; eqt: number } {
  const D = jd - 2451545.0
  const g = fixAngle(357.529 + 0.98560028 * D)
  const q = fixAngle(280.459 + 0.98564736 * D)
  const L = fixAngle(q + 1.915 * sinD(g) + 0.02 * sinD(2 * g))
  const e = 23.439 - 0.00000036 * D
  const decl = arcsinD(sinD(e) * sinD(L))
  const RA = fixHour(arctan2D(cosD(e) * sinD(L), cosD(L)) / 15)
  const eqt = q / 15 - RA
  return { decl, eqt }
}

function midDay(jDate: number, timeFraction: number): number {
  return fixHour(12 - sunPosition(jDate + timeFraction).eqt)
}

function sunAngleTime(jDate: number, angle: number, timeFraction: number, ccw: boolean): number {
  const decl = sunPosition(jDate + timeFraction).decl
  const noon = midDay(jDate, timeFraction)
  const portion =
    arccosD((-sinD(angle) - sinD(decl) * sinD(LAT)) / (cosD(decl) * cosD(LAT))) / 15
  return noon + (ccw ? -portion : portion)
}

function asrTime(jDate: number, timeFraction: number): number {
  const decl = sunPosition(jDate + timeFraction).decl
  const noon = midDay(jDate, timeFraction)
  const angle = -arccotD(ASR_FACTOR + Math.abs(tanD(LAT - decl)))
  const portion = arccosD((-sinD(angle) - sinD(decl) * sinD(LAT)) / (cosD(decl) * cosD(LAT))) / 15
  return noon + portion
}

/** Builds a UTC Date instant for a given EAT calendar date and EAT clock-time hour (can be fractional/out of range). */
function toUtcDate(year: number, month: number, day: number, eatHour: number): Date {
  const utcHour = eatHour - TIMEZONE
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
  date.setUTCMinutes(Math.round(utcHour * 60))
  return date
}

export interface PrayerTimes {
  fajr: Date
  sunrise: Date
  dhuhr: Date
  asr: Date
  maghrib: Date
  isha: Date
}

/**
 * Per-prayer minute corrections against the calculated time, e.g. when local
 * announced times consistently differ from the Muslim World League angles
 * this calculation assumes. Admin-configurable, see rotation_settings.
 */
export interface PrayerOffsets {
  fajr: number
  dhuhr: number
  asr: number
  maghrib: number
  isha: number
}

export const ZERO_PRAYER_OFFSETS: PrayerOffsets = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }

function addMinutes(date: Date, minutes: number): Date {
  return minutes === 0 ? date : new Date(date.getTime() + minutes * 60_000)
}

/** Computes the 5 daily prayer times (plus sunrise) for the given EAT calendar date. */
export function getPrayerTimes(
  year: number,
  month: number,
  day: number,
  offsets: PrayerOffsets = ZERO_PRAYER_OFFSETS,
): PrayerTimes {
  const jDate = julianDate(year, month, day)
  const lngCorrection = LNG / 15

  const toLocal = (t: number) => fixHour(t + TIMEZONE - lngCorrection)

  const fajr = toLocal(sunAngleTime(jDate, FAJR_ANGLE, 5 / 24, true))
  const sunrise = toLocal(sunAngleTime(jDate, 0.833, 6 / 24, true))
  const dhuhr = toLocal(midDay(jDate, 12 / 24))
  const asr = toLocal(asrTime(jDate, 13 / 24))
  const maghrib = toLocal(sunAngleTime(jDate, 0.833, 18 / 24, false))
  const isha = toLocal(sunAngleTime(jDate, ISHA_ANGLE, 19 / 24, false))

  return {
    fajr: addMinutes(toUtcDate(year, month, day, fajr), offsets.fajr),
    sunrise: toUtcDate(year, month, day, sunrise), // not a prayer — no offset
    dhuhr: addMinutes(toUtcDate(year, month, day, dhuhr), offsets.dhuhr),
    asr: addMinutes(toUtcDate(year, month, day, asr), offsets.asr),
    maghrib: addMinutes(toUtcDate(year, month, day, maghrib), offsets.maghrib),
    isha: addMinutes(toUtcDate(year, month, day, isha), offsets.isha),
  }
}

export const PRAYER_NAMES_SW: Record<keyof Omit<PrayerTimes, "sunrise">, string> = {
  fajr: "Alfajiri",
  dhuhr: "Adhuhuri",
  asr: "Alasiri",
  maghrib: "Magharibi",
  isha: "Isha",
}

export interface NextPrayer {
  name: string
  label: string
  time: Date
}

/** Returns the next upcoming daily prayer (Fajr/Dhuhr/Asr/Maghrib/Isha) relative to `now`. */
export function getNextPrayer(now: Date = new Date(), offsets: PrayerOffsets = ZERO_PRAYER_OFFSETS): NextPrayer {
  // Determine "today" in EAT
  const eatNow = new Date(now.getTime() + TIMEZONE * 3600 * 1000)
  const year = eatNow.getUTCFullYear()
  const month = eatNow.getUTCMonth() + 1
  const day = eatNow.getUTCDate()

  const today = getPrayerTimes(year, month, day, offsets)
  const order: (keyof Omit<PrayerTimes, "sunrise">)[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"]

  for (const name of order) {
    if (today[name].getTime() > now.getTime()) {
      return { name, label: PRAYER_NAMES_SW[name], time: today[name] }
    }
  }

  // All of today's prayers have passed — next is tomorrow's Fajr
  const tomorrow = new Date(eatNow.getTime() + 24 * 3600 * 1000)
  const tYear = tomorrow.getUTCFullYear()
  const tMonth = tomorrow.getUTCMonth() + 1
  const tDay = tomorrow.getUTCDate()
  const fajrTomorrow = getPrayerTimes(tYear, tMonth, tDay, offsets).fajr
  return { name: "fajr", label: PRAYER_NAMES_SW.fajr, time: fajrTomorrow }
}

/** Formats a millisecond duration as "Hh Mm" or "Mm Ss" for countdown display. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m ${seconds}s`
}

/** Formats a millisecond duration as "HhMmSs", always showing all three units. */
export function formatCountdownHMS(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours}h${minutes}m${seconds}s`
}
