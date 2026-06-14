// Core types for the Islamic Knowledge App

export interface QuranVerse {
  id: string
  surahNumber: number
  verseNumber: number
  arabicText: string
  swahiliTranslation: string
  tafsir?: string
  moral?: string
}

export interface Surah {
  id: number
  name: string
  arabicName: string
  numberOfVerses: number
  revelationType: "Makki" | "Madani"
  juzStart: number
}

export interface Juz {
  number: number
  arabicName: string
  startSurah: number
  startVerse: number
  endSurah: number
  endVerse: number
  totalVerses: number
}

export interface Hadith {
  id: string
  arabicText: string
  swahiliTranslation: string
  narrator: string
  source: string
  category: string
  date: string
}

export interface Article {
  id: string
  title: string
  content: string
  category: string
  author: string
  publishedDate: string
  imageUrl?: string
}

export interface Dua {
  id: string
  arabicText: string
  swahiliTranslation: string
  transliteration?: string
  category: string
  occasion: string
  reference?: string
}

export interface Adhkar {
  id: string
  arabicText: string
  swahiliTranslation: string
  transliteration: string
  count: number          // recommended repetition count
  benefit: string        // faida/thawabu
  reference: string
  slot: "asubuhi" | "jioni"  // morning or evening
  order: number          // position within slot
}

export interface Book {
  id: string
  title: string
  author: string
  description: string
  category: string
  language: string
  coverUrl?: string
  fileUrl?: string       // PDF / epub path
  totalPages?: number
  publishedYear?: string
  downloadCount: number
  addedDate: string
  isAvailable: boolean
}

