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

const HIJRI_FORMATTER = new Intl.DateTimeFormat("en-US", {
  calendar: "islamic-civil",
  day: "numeric",
  month: "numeric",
  year: "numeric",
})

export function gregorianToHijri(date: Date = new Date()): HijriDate {
  const parts = HIJRI_FORMATTER.formatToParts(date)
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
