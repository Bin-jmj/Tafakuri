import { z } from "zod"
import type { CmsResourceConfig } from "./types"

const HADITH_CATEGORIES = ["Imani", "Ibada", "Akhlaq", "Familia", "Elimu", "Sadaka", "Adabu", "Afya", "Faraja"]
const DUA_CATEGORIES = ["Kuanza Jambo", "Shukrani", "Afya", "Elimu", "Faraja", "Imani", "Familia", "Safari", "Chakula"]
const ARTICLE_CATEGORIES = ["Hadith", "Fiqh", "Tafsiri", "Akida", "Siira", "Lugha", "Tarbiya"]
const MEDIA_CATEGORIES = ["Hadith", "Fiqh", "Tafsiri", "Akida", "Siira", "Lugha", "Tarbiya"]

const optionalText = z.string().trim().optional().or(z.literal("")).transform((v) => (v ? v : null))

export const hadithsResource: CmsResourceConfig = {
  key: "hadiths",
  table: "hadiths",
  titleSingular: "Hadithi",
  titlePlural: "Hadithi",
  description: "Simamia hadithi zilizopo kwenye mfumo",
  addLabel: "Ongeza Hadithi",
  searchPlaceholder: "Tafuta hadithi, mpokezi au chanzo...",
  primaryColumn: "translation_sw",
  orderBy: { column: "created_at", ascending: false },
  fields: [
    { name: "arabic_text", label: "Maandishi ya Kiarabu", type: "arabic" },
    { name: "translation_sw", label: "Tafsiri ya Kiswahili", type: "textarea", showInTable: true, searchable: true },
    { name: "narrator", label: "Mpokezi", type: "text", showInTable: true, searchable: true },
    { name: "source", label: "Chanzo", type: "text", showInTable: true, searchable: true },
    { name: "category", label: "Kategoria", type: "select", options: HADITH_CATEGORIES.map((c) => ({ label: c, value: c })), showInTable: true, searchable: true },
  ],
  schema: z.object({
    arabic_text: z.string().min(1, "Maandishi ya Kiarabu yanahitajika"),
    translation_sw: z.string().min(1, "Tafsiri ya Kiswahili inahitajika"),
    narrator: z.string().min(1, "Mpokezi anahitajika"),
    source: z.string().min(1, "Chanzo kinahitajika"),
    category: z.string().min(1, "Kategoria inahitajika"),
  }),
  defaultValues: {
    arabic_text: "",
    translation_sw: "",
    narrator: "",
    source: "",
    category: HADITH_CATEGORIES[0],
  },
}

export const duasResource: CmsResourceConfig = {
  key: "duas",
  table: "duas",
  titleSingular: "Dua",
  titlePlural: "Dua",
  description: "Simamia dua zilizopo kwenye mfumo",
  addLabel: "Ongeza Dua",
  searchPlaceholder: "Tafuta dua, kategoria au tukio...",
  primaryColumn: "translation_sw",
  orderBy: { column: "created_at", ascending: false },
  fields: [
    { name: "arabic_text", label: "Maandishi ya Kiarabu", type: "arabic" },
    { name: "translation_sw", label: "Tafsiri ya Kiswahili", type: "textarea", showInTable: true, searchable: true },
    { name: "transliteration", label: "Matamshi (Lafudhi)", type: "text" },
    { name: "category", label: "Kategoria", type: "select", options: DUA_CATEGORIES.map((c) => ({ label: c, value: c })), showInTable: true, searchable: true },
    { name: "occasion", label: "Tukio", type: "text", showInTable: true, searchable: true },
    { name: "reference", label: "Marejeo", type: "text" },
  ],
  schema: z.object({
    arabic_text: z.string().min(1, "Maandishi ya Kiarabu yanahitajika"),
    translation_sw: z.string().min(1, "Tafsiri ya Kiswahili inahitajika"),
    transliteration: optionalText,
    category: z.string().min(1, "Kategoria inahitajika"),
    occasion: optionalText,
    reference: optionalText,
  }),
  defaultValues: {
    arabic_text: "",
    translation_sw: "",
    transliteration: "",
    category: DUA_CATEGORIES[0],
    occasion: "",
    reference: "",
  },
}

export const adhkarResource: CmsResourceConfig = {
  key: "adhkar",
  table: "adhkar",
  titleSingular: "Dhikr",
  titlePlural: "Adhkar",
  description: "Simamia adhkar za asubuhi na jioni",
  addLabel: "Ongeza Dhikr",
  searchPlaceholder: "Tafuta dhikr...",
  primaryColumn: "translation_sw",
  orderBy: { column: "sort_order", ascending: true },
  fields: [
    { name: "arabic_text", label: "Maandishi ya Kiarabu", type: "arabic" },
    { name: "translation_sw", label: "Tafsiri ya Kiswahili", type: "textarea", showInTable: true, searchable: true },
    { name: "transliteration", label: "Matamshi (Lafudhi)", type: "text" },
    { name: "slot", label: "Wakati", type: "select", options: [{ label: "Asubuhi", value: "asubuhi" }, { label: "Jioni", value: "jioni" }], showInTable: true },
    { name: "count", label: "Idadi ya Kurudia", type: "number", showInTable: true },
    { name: "sort_order", label: "Mpangilio", type: "number" },
    { name: "benefit", label: "Faida", type: "textarea" },
    { name: "reference", label: "Marejeo", type: "text" },
  ],
  schema: z.object({
    arabic_text: z.string().min(1, "Maandishi ya Kiarabu yanahitajika"),
    translation_sw: z.string().min(1, "Tafsiri ya Kiswahili inahitajika"),
    transliteration: optionalText,
    slot: z.enum(["asubuhi", "jioni"]),
    count: z.coerce.number().int().min(1).default(1),
    sort_order: z.coerce.number().int().default(0),
    benefit: optionalText,
    reference: optionalText,
  }),
  defaultValues: {
    arabic_text: "",
    translation_sw: "",
    transliteration: "",
    slot: "asubuhi",
    count: 1,
    sort_order: 0,
    benefit: "",
    reference: "",
  },
}

export const articlesResource: CmsResourceConfig = {
  key: "articles",
  table: "articles",
  titleSingular: "Makala",
  titlePlural: "Makala",
  description: "Simamia makala zilizochapishwa",
  addLabel: "Ongeza Makala",
  searchPlaceholder: "Tafuta makala, mwandishi au kategoria...",
  primaryColumn: "title",
  orderBy: { column: "published_date", ascending: false },
  fields: [
    { name: "title", label: "Kichwa", type: "text", showInTable: true, searchable: true },
    { name: "content", label: "Maudhui", type: "textarea", searchable: true },
    { name: "category", label: "Kategoria", type: "select", options: ARTICLE_CATEGORIES.map((c) => ({ label: c, value: c })), showInTable: true, searchable: true },
    { name: "author", label: "Mwandishi", type: "text", showInTable: true, searchable: true },
    { name: "published_date", label: "Tarehe ya Kuchapisha", type: "date", showInTable: true },
    { name: "image_url", label: "Picha ya Jalada", type: "image" },
  ],
  schema: z.object({
    title: z.string().min(1, "Kichwa kinahitajika"),
    content: z.string().min(1, "Maudhui yanahitajika"),
    category: z.string().min(1, "Kategoria inahitajika"),
    author: z.string().min(1, "Mwandishi anahitajika"),
    published_date: z.string().min(1, "Tarehe inahitajika"),
    image_url: optionalText,
  }),
  defaultValues: {
    title: "",
    content: "",
    category: ARTICLE_CATEGORIES[0],
    author: "",
    published_date: new Date().toISOString().slice(0, 10),
    image_url: "",
  },
}

export const quranVersesResource: CmsResourceConfig = {
  key: "quran-verses",
  table: "quran_verses",
  titleSingular: "Aya",
  titlePlural: "Aya za Qur'an",
  description: "Simamia aya, tafsiri na maelezo ya Qur'an",
  addLabel: "Ongeza Aya",
  searchPlaceholder: "Tafuta tafsiri au tafsiri ya aya...",
  primaryColumn: "translation_sw",
  orderBy: { column: "created_at", ascending: false },
  fields: [
    { name: "surah_number", label: "Namba ya Sura (1-114)", type: "number", showInTable: true },
    { name: "verse_number", label: "Namba ya Aya", type: "number", showInTable: true },
    { name: "arabic_text", label: "Maandishi ya Kiarabu", type: "arabic" },
    { name: "translation_sw", label: "Tafsiri ya Kiswahili", type: "textarea", showInTable: true, searchable: true },
    { name: "tafsir", label: "Maelezo ya Tafsiri (Hiari)", type: "textarea", searchable: true },
    { name: "moral", label: "Fundisho/Somo (Hiari)", type: "textarea", searchable: true },
  ],
  schema: z.object({
    surah_number: z.coerce.number().int().min(1, "Namba ya sura ni 1-114").max(114, "Namba ya sura ni 1-114"),
    verse_number: z.coerce.number().int().min(1, "Namba ya aya inahitajika"),
    arabic_text: z.string().min(1, "Maandishi ya Kiarabu yanahitajika"),
    translation_sw: z.string().min(1, "Tafsiri ya Kiswahili inahitajika"),
    tafsir: optionalText,
    moral: optionalText,
  }),
  defaultValues: {
    surah_number: 1,
    verse_number: 1,
    arabic_text: "",
    translation_sw: "",
    tafsir: "",
    moral: "",
  },
  extraFilters: [
    { name: "surah_number", label: "Sura", type: "number", min: 1, max: 114, placeholder: "Namba ya Sura (1-114)" },
    { name: "verse_number", label: "Aya (kati ya)", type: "number-range", placeholder: "Namba ya Aya" },
  ],
}

function mediaResource(type: "book" | "audio" | "video"): CmsResourceConfig {
  const labels = {
    book: { singular: "Kitabu", plural: "Vitabu", add: "Ongeza Kitabu" },
    audio: { singular: "Sauti", plural: "Mafunzo ya Sauti", add: "Ongeza Sauti" },
    video: { singular: "Video", plural: "Video", add: "Ongeza Video" },
  }[type]

  return {
    key: `media-${type}`,
    table: "media_items",
    titleSingular: labels.singular,
    titlePlural: labels.plural,
    description: `Simamia ${labels.plural.toLowerCase()} zilizopakiwa kwenye Google Drive`,
    addLabel: labels.add,
    searchPlaceholder: "Tafuta kwa jina au mwandishi...",
    primaryColumn: "title",
    orderBy: { column: "created_at", ascending: false },
    filter: { type },
    fields: [
      { name: "title", label: "Jina", type: "text", showInTable: true, searchable: true },
      { name: "author", label: "Mwandishi / Mzungumzaji", type: "text", showInTable: true, searchable: true },
      { name: "description", label: "Maelezo", type: "textarea", searchable: true },
      { name: "category", label: "Kategoria", type: "select", options: MEDIA_CATEGORIES.map((c) => ({ label: c, value: c })), showInTable: true, searchable: true },
      { name: "language", label: "Lugha", type: "text" },
      { name: "cover_url", label: "Picha ya Jalada", type: "image" },
      { name: "file", label: "Faili (Drive)", type: "drive-file", driveType: type, showInTable: true },
      ...(type === "book" ? [{ name: "total_pages", label: "Idadi ya Kurasa", type: "number" as const }] : []),
      ...(type !== "book" ? [{ name: "duration_seconds", label: "Muda (Sekunde)", type: "number" as const }] : []),
      { name: "published_year", label: "Mwaka", type: "text" },
      { name: "is_available", label: "Inapatikana", type: "boolean", showInTable: true },
    ],
    schema: z.object({
      title: z.string().min(1, "Jina linahitajika"),
      author: optionalText,
      description: optionalText,
      category: z.string().min(1, "Kategoria inahitajika"),
      language: z.string().min(1).default("Swahili"),
      cover_url: optionalText,
      drive_file_id: optionalText,
      drive_mime_type: optionalText,
      file_size_bytes: z.coerce.number().int().optional().nullable(),
      total_pages: z.coerce.number().int().optional().nullable(),
      duration_seconds: z.coerce.number().int().optional().nullable(),
      published_year: optionalText,
      is_available: z.boolean().default(true),
    }),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      category: MEDIA_CATEGORIES[0],
      language: "Swahili",
      cover_url: "",
      drive_file_id: "",
      drive_mime_type: "",
      file_size_bytes: null,
      total_pages: null,
      duration_seconds: null,
      published_year: "",
      is_available: true,
    },
  }
}

export const mediaBooksResource = mediaResource("book")
export const mediaAudioResource = mediaResource("audio")
export const mediaVideoResource = mediaResource("video")

export const cmsResources: Record<string, CmsResourceConfig> = {
  [hadithsResource.key]: hadithsResource,
  [duasResource.key]: duasResource,
  [adhkarResource.key]: adhkarResource,
  [articlesResource.key]: articlesResource,
  [quranVersesResource.key]: quranVersesResource,
  [mediaBooksResource.key]: mediaBooksResource,
  [mediaAudioResource.key]: mediaAudioResource,
  [mediaVideoResource.key]: mediaVideoResource,
}
