// Offline sync: keeps IndexedDB fresh with the server's core content and
// replays queued bookmark / reading-progress mutations to Supabase.
//
// Conflict policy (per docs/PLAN-OFFLINE-NATIVE.md):
// - Local writes win until they are successfully flushed (the outbox replays
//   them last).
// - On pull from the server, records that exist locally *and* are already
//   synced get refreshed from the server; unsynced local records are kept.

import { createClient } from "@/lib/supabase/client"
import {
  ANON_SCOPE,
  bookmarkRecordKey,
  getDB,
  type BookmarkContentType,
  type BookmarkRecord,
  type ReadingContentType,
  type ReadingProgressRecord,
} from "@/lib/offline/db"

/**
 * Fetches the core content bundle and stores it in IndexedDB when the
 * server's content version is newer than the stored one. Returns true when
 * a sync actually happened. Safe to call repeatedly; it no-ops offline.
 */
export async function syncCoreContent(): Promise<boolean> {
  try {
    const versionRes = await fetch("/api/content-version")
    if (!versionRes.ok) return false
    const { version } = (await versionRes.json()) as { version: number }

    const db = await getDB()
    const stored = await db.get("content_meta", "core")
    if (stored && stored.version === version) return false

    const contentRes = await fetch("/api/offline/content")
    if (!contentRes.ok) return false
    const bundle = (await contentRes.json()) as {
      version: number
      surahs: import("@/lib/types").Surah[]
      quran: import("@/lib/types").QuranVerse[]
      hadith: import("@/lib/types").Hadith[]
      dua: import("@/lib/types").Dua[]
      adhkar: import("@/lib/types").Adhkar[]
    }

    const tx = db.transaction(["surahs", "quran", "hadith", "dua", "adhkar", "content_meta"], "readwrite")
    await Promise.all([
      tx.objectStore("surahs").clear(),
      tx.objectStore("quran").clear(),
      tx.objectStore("hadith").clear(),
      tx.objectStore("dua").clear(),
      tx.objectStore("adhkar").clear(),
    ])
    for (const row of bundle.surahs) void tx.objectStore("surahs").put(row)
    for (const row of bundle.quran) void tx.objectStore("quran").put(row)
    for (const row of bundle.hadith) void tx.objectStore("hadith").put(row)
    for (const row of bundle.dua) void tx.objectStore("dua").put(row)
    for (const row of bundle.adhkar) void tx.objectStore("adhkar").put(row)
    tx.objectStore("content_meta").put({
      key: "core",
      version: bundle.version,
      syncedAt: Date.now(),
    })
    await tx.done
    return true
  } catch {
    // Offline or storage unavailable - retried on a future visit.
    return false
  }
}

/**
 * Replays the outbox against Supabase for the given signed-in user.
 * Returns the number of successfully applied operations.
 */
export async function flushOutbox(userId: string): Promise<number> {
  const supabase = createClient()
  const db = await getDB()
  let applied = 0

  // Snapshot first: awaiting network calls inside an open IDB transaction
  // would auto-commit it. Apply + delete each entry in its own transaction.
  const entries = await db.getAll("outbox")
  for (const entry of entries) {
    if (typeof entry.id !== "number") continue
    const ok = await applyOutboxEntry(supabase, entry.kind, entry.op, entry.payload, userId)
    if (ok) {
      applied++
      await markSourceSynced(db, entry, userId)
      await db.delete("outbox", entry.id)
    }
  }
  return applied
}

async function applyOutboxEntry(
  supabase: ReturnType<typeof createClient>,
  kind: string,
  op: string,
  payload: Record<string, unknown>,
  userId: string,
): Promise<boolean> {
  const userIdPayload = { ...payload, user_id: userId }
  const contentType = String(payload.content_type)
  const contentId = String(payload.content_id)

  try {
    if (kind === "bookmark") {
      if (op === "delete") {
        await deleteSupabaseBookmark(supabase, userId, contentType, contentId)
      } else {
        // No unique constraint on (user_id, content_type, content_id) in the
        // bookmarks table, so emulate upsert: delete then insert.
        await deleteSupabaseBookmark(supabase, userId, contentType, contentId)
        const { error } = await supabase.from("bookmarks").insert({
          user_id: userId,
          content_type: contentType as BookmarkContentType,
          content_id: contentId,
        })
        if (error) throw error
      }
      return true
    }

    if (kind === "reading_progress") {
      // reading_progress has a unique constraint; native upsert works.
      const { error } = await supabase
        .from("reading_progress")
        .upsert(
          {
            user_id: userId,
            content_type: String(payload.content_type) as "book" | "article",
            content_id: contentId,
            progress_percent: Number(payload.progress_percent ?? 0),
            current_page: payload.current_page == null ? null : Number(payload.current_page),
            total_pages: payload.total_pages == null ? null : Number(payload.total_pages),
          },
          { onConflict: "user_id,content_type,content_id" },
        )
      if (error) throw error
      return true
    }

    return false
  } catch {
    return false
  }
}

async function deleteSupabaseBookmark(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  contentType: string,
  contentId: string,
): Promise<void> {
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("content_type", contentType as BookmarkContentType)
    .eq("content_id", contentId)
  if (error) throw error
}

async function markSourceSynced(
  db: Awaited<ReturnType<typeof getDB>>,
  entry: { kind: string; op: string; payload: Record<string, unknown> },
  userId: string,
): Promise<void> {
  const contentType = String(entry.payload.content_type)
  const contentId = String(entry.payload.content_id)
  const key = bookmarkRecordKey(userId, contentType, contentId)

  if (entry.kind === "bookmark") {
    const record = await db.get("bookmarks", key)
    if (record) {
      if (entry.op === "delete" && record.deleted) {
        await db.delete("bookmarks", key)
      } else {
        await db.put("bookmarks", { ...record, synced: true })
      }
    }
    return
  }

  if (entry.kind === "reading_progress") {
    const record = await db.get("reading_progress", key)
    if (record) await db.put("reading_progress", { ...record, synced: true })
  }
}

/**
 * Pulls the user's server-side bookmarks and reading progress into
 * IndexedDB. Already-synced local records lose to the server; unsynced
 * local records are kept so their outbox entries can still flush.
 */
export async function pullUserContent(userId: string): Promise<void> {
  const supabase = createClient()
  const db = await getDB()
  const [{ data: bookmarkRows }, { data: progressRows }] = await Promise.all([
    supabase.from("bookmarks").select("content_type, content_id, created_at").eq("user_id", userId),
    supabase
      .from("reading_progress")
      .select("content_type, content_id, progress_percent, current_page, total_pages, updated_at")
      .eq("user_id", userId),
  ])
  if (!bookmarkRows && !progressRows) return

  for (const row of bookmarkRows ?? []) {
    const key = bookmarkRecordKey(userId, row.content_type, row.content_id)
    const local = await db.get("bookmarks", key)
    if (!local || local.synced) {
      await db.put("bookmarks", {
        key,
        userId,
        contentType: row.content_type as BookmarkContentType,
        contentId: row.content_id,
        synced: true,
        deleted: false,
        updatedAt: Date.parse(row.created_at) || Date.now(),
      } satisfies BookmarkRecord)
    }
  }

  for (const row of progressRows ?? []) {
    const key = bookmarkRecordKey(userId, row.content_type, row.content_id)
    const local = await db.get("reading_progress", key)
    if (!local || local.synced) {
      await db.put("reading_progress", {
        key,
        userId,
        contentType: row.content_type as ReadingContentType,
        contentId: row.content_id,
        progressPercent: row.progress_percent,
        currentPage: row.current_page ?? undefined,
        totalPages: row.total_pages ?? undefined,
        synced: true,
        updatedAt: Date.parse(row.updated_at) || Date.now(),
      } satisfies ReadingProgressRecord)
    }
  }
}

/**
 * One-time migration: when a user signs in, promote any bookmarks they made
 * while anonymous into their account scope and queue them for upload. The
 * anon records are then removed so the anon scope never resurfaces.
 */
export async function mergeAnonBookmarks(userId: string): Promise<void> {
  const db = await getDB()
  const anonRecords = await db.getAllFromIndex("bookmarks", "by_user", ANON_SCOPE)
  const flag = await db.get("content_meta", "anon_merged")
  if (anonRecords.length === 0 && flag) return

  for (const record of anonRecords) {
    if (record.deleted) {
      await db.delete("bookmarks", record.key)
      continue
    }
    const key = bookmarkRecordKey(userId, record.contentType, record.contentId)
    const existing = await db.get("bookmarks", key)
    if (!existing) {
      await db.put("bookmarks", {
        ...record,
        key,
        userId,
        synced: false,
        updatedAt: Date.now(),
      })
      await enqueueOutbox(db, "bookmark", "upsert", {
        content_type: record.contentType,
        content_id: record.contentId,
      })
    }
    await db.delete("bookmarks", record.key)
  }

  await db.put("content_meta", { key: "anon_merged", version: 1, syncedAt: Date.now() })
}

export async function enqueueOutbox(
  db: Awaited<ReturnType<typeof getDB>>,
  kind: "bookmark" | "reading_progress",
  op: "upsert" | "delete",
  payload: Record<string, unknown>,
): Promise<void> {
  await db.add("outbox", { kind, op, payload, createdAt: Date.now() })
}
