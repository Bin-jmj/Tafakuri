// Maps Supabase row shapes (snake_case) to the app's existing camelCase types.

import type { Database } from "@/lib/supabase/types"
import type { Adhkar, Article, Book, Dua, Hadith, QuranVerse, Surah } from "@/lib/types"
import type { RotationSettings } from "@/lib/utils/rotation"

type Tables = Database["public"]["Tables"]

export function mapSurah(row: Tables["surahs"]["Row"]): Surah {
  return {
    id: row.id,
    name: row.name,
    arabicName: row.arabic_name,
    numberOfVerses: row.number_of_verses,
    revelationType: row.revelation_type as Surah["revelationType"],
    juzStart: row.juz_start,
  }
}

export function mapQuranVerse(row: Tables["quran_verses"]["Row"]): QuranVerse {
  return {
    id: row.id,
    surahNumber: row.surah_number,
    verseNumber: row.verse_number,
    arabicText: row.arabic_text,
    swahiliTranslation: row.translation_sw,
    tafsir: row.tafsir ?? undefined,
    moral: row.moral ?? undefined,
  }
}

export function mapHadith(row: Tables["hadiths"]["Row"]): Hadith {
  return {
    id: row.id,
    arabicText: row.arabic_text,
    swahiliTranslation: row.translation_sw,
    narrator: row.narrator,
    source: row.source,
    category: row.category,
    date: row.created_at,
  }
}

export function mapDua(row: Tables["duas"]["Row"]): Dua {
  return {
    id: row.id,
    arabicText: row.arabic_text,
    swahiliTranslation: row.translation_sw,
    transliteration: row.transliteration ?? undefined,
    category: row.category,
    occasion: row.occasion ?? "",
    reference: row.reference ?? undefined,
  }
}

export function mapAdhkar(row: Tables["adhkar"]["Row"]): Adhkar {
  return {
    id: row.id,
    arabicText: row.arabic_text,
    swahiliTranslation: row.translation_sw,
    transliteration: row.transliteration ?? "",
    count: row.count,
    benefit: row.benefit ?? "",
    reference: row.reference ?? "",
    slot: row.slot as Adhkar["slot"],
    order: row.sort_order,
  }
}

export function mapArticle(row: Tables["articles"]["Row"]): Article {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    author: row.author,
    publishedDate: row.published_date,
    imageUrl: row.image_url ?? undefined,
  }
}

export function mapRotationSettings(row: Tables["rotation_settings"]["Row"]): RotationSettings {
  return {
    adhkarAsubuhiStart: row.adhkar_asubuhi_start,
    adhkarJioniStart: row.adhkar_jioni_start,
    contentFajrStart: row.content_fajr_start,
    contentDhuhrStart: row.content_dhuhr_start,
    contentAsrStart: row.content_asr_start,
    contentMaghribStart: row.content_maghrib_start,
    contentIshaStart: row.content_isha_start,
  }
}

export function mapBook(row: Tables["media_items"]["Row"]): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author ?? "",
    description: row.description ?? "",
    category: row.category,
    language: row.language,
    coverUrl: row.cover_url ?? undefined,
    fileUrl: row.drive_file_id ? `/api/drive/file/${row.drive_file_id}` : undefined,
    totalPages: row.total_pages ?? undefined,
    publishedYear: row.published_year ?? undefined,
    downloadCount: row.download_count,
    addedDate: row.created_at,
    isAvailable: row.is_available,
  }
}
