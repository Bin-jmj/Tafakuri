// Conversion to the Islamic (Hijri) calendar using the tabular/civil algorithm.
// This is an approximation (+/- 1 day) commonly used for "today's date" display -
// for exact moon-sighting dates, a local mosque announcement should be preferred.

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

export function gregorianToHijri(date: Date = new Date()): HijriDate {
  // Julian day number for the given Gregorian date (at UTC midnight).
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()

  const jd =
    Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4) +
    Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4) +
    d -
    32075

  // Julian day to tabular Islamic calendar (Kuwaiti algorithm).
  const l1 = jd - 1948440 + 10632
  const n = Math.floor((l1 - 1) / 10631)
  const l2 = l1 - 10631 * n + 354
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238)
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29
  const month = Math.floor((24 * l3) / 709)
  const day = l3 - Math.floor((709 * month) / 24)
  const year = 30 * n + j - 30

  return {
    day,
    month,
    monthName: HIJRI_MONTHS_SW[month - 1],
    year,
  }
}

export function formatHijriDate(date: Date = new Date()): string {
  const h = gregorianToHijri(date)
  return `${h.day} ${h.monthName} ${h.year} AH`
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
