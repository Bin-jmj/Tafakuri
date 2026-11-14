// IndexedDB schema and typed accessors for Tafakuri's offline data layer.
//
// Design rules:
// - The service worker (public/sw.js) stays responsible for caching routes,
//   RSC payloads, static assets and downloaded book files. IndexedDB holds
//   only *structured* data: core content for offline reads, plus the
//   user's bookmarks / reading progress / sync state.
// - Every user-scoped record carries `synced` + tombstone (`deleted`)
//   flags so mutations can queue in the `outbox` store and replay to
//   Supabase when connectivity returns (see lib/offline/sync.ts).

import { openDB, deleteDB, type DBSchema, type IDBPDatabase } from "idb"
import type { Adhkar, Dua, Hadith, QuranVerse, Surah } from "@/lib/types"

export type BookmarkContentType =
  | "quran_verse"
  | "hadith"
  | "dua"
  | "adhkar"
  | "article"
  | "media"

export type ReadingContentType = "book" | "article"

/** Scope used for records made before the user signs in. */
export const ANON_SCOPE = "anon"

export const DB_NAME = "tafakuri"
export const DB_VERSION = 1

export interface BookmarkRecord {
  /** `${scope}:${contentType}:${contentId}` */
  key: string
  /** Supabase user id, or ANON_SCOPE. */
  userId: string
  contentType: BookmarkContentType
  contentId: string
  synced: boolean
  /** Tombstone so a queued deletion survives until the outbox flushes. */
  deleted: boolean
  updatedAt: number
}

export interface ReadingProgressRecord {
  /** `${scope}:${contentType}:${contentId}` */
  key: string
  userId: string
  contentType: ReadingContentType
  contentId: string
  progressPercent: number
  currentPage?: number
  totalPages?: number
  synced: boolean
  updatedAt: number
}

export interface OutboxRecord {
  id?: number
  kind: "bookmark" | "reading_progress"
  op: "upsert" | "delete"
  /** Supabase-shaped payload for upserts; triple key for deletes. */
  payload: Record<string, unknown>
  createdAt: number
}

export interface ContentMetaRecord {
  key: string
  version: number
  syncedAt: number
}

interface TafakuriDBSchema extends DBSchema {
  /** Complete Qur'an text (camelCase app types, per lib/mappers.ts). */
  quran: { key: string; value: QuranVerse; indexes: { by_surah: number } }
  hadith: { key: string; value: Hadith }
  dua: { key: string; value: Dua }
  adhkar: { key: string; value: Adhkar; indexes: { by_slot: string } }
  surahs: { key: number; value: Surah }
  /** Version bookkeeping: "core" = content bundle, "anon_merged" = flag. */
  content_meta: { key: string; value: ContentMetaRecord }
  bookmarks: {
    key: string
    value: BookmarkRecord
    indexes: { by_user: string }
  }
  reading_progress: {
    key: string
    value: ReadingProgressRecord
    indexes: { by_user: string }
  }
  outbox: { key: number; value: OutboxRecord }
}

export type TafakuriDB = IDBPDatabase<TafakuriDBSchema>

let dbPromise: Promise<TafakuriDB> | null = null

export function getDB(): Promise<TafakuriDB> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB unavailable"))
  }
  if (!dbPromise) {
    dbPromise = openDB<TafakuriDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const surahs = db.createObjectStore("surahs", { keyPath: "id" })
        void surahs
        const quran = db.createObjectStore("quran", { keyPath: "id" })
        quran.createIndex("by_surah", "surahNumber")
        db.createObjectStore("hadith", { keyPath: "id" })
        db.createObjectStore("dua", { keyPath: "id" })
        const adhkar = db.createObjectStore("adhkar", { keyPath: "id" })
        adhkar.createIndex("by_slot", "slot")
        db.createObjectStore("content_meta", { keyPath: "key" })
        const bookmarks = db.createObjectStore("bookmarks", { keyPath: "key" })
        bookmarks.createIndex("by_user", "userId")
        const progress = db.createObjectStore("reading_progress", { keyPath: "key" })
        progress.createIndex("by_user", "userId")
        db.createObjectStore("outbox", { keyPath: "id", autoIncrement: true })
      },
    })
  }
  return dbPromise
}

/** Destroys the local database (used by "clear offline data" flows/tests). */
export async function resetDB(): Promise<void> {
  dbPromise = null
  await deleteDB(DB_NAME)
}

export function bookmarkRecordKey(scope: string, contentType: string, contentId: string): string {
  return `${scope}:${contentType}:${contentId}`
}
