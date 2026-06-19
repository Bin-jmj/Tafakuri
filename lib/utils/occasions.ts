// Resolves which (if any) special occasion is active right now, and returns
// the content_id pool it defines for a given content type. Purely additive:
// callers fall back to their normal rotation logic whenever this returns
// null or an empty pool, so existing behavior is unaffected when no
// occasion is configured or active.

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"
import type { OccasionContentType } from "@/lib/types"

export interface ActiveOccasionPool {
  occasionId: string
  occasionName: string
  itemIds: string[]
}

export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 1)
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000) + 1
}

/**
 * Returns the highest-priority active occasion that has items for
 * `contentType`, with its ordered content_id pool — or null if no occasion
 * is active (or none of the active ones have items for this type).
 */
export async function getActiveOccasionItemIds(
  supabase: SupabaseClient<Database>,
  contentType: OccasionContentType,
): Promise<ActiveOccasionPool | null> {
  const today = new Date()
  const todayISO = today.toISOString().slice(0, 10)
  const isFriday = today.getDay() === 5

  const { data: occasions } = await supabase
    .from("occasions")
    .select("id, name, recurrence, start_date, end_date")
    .eq("is_active", true)
    .order("priority", { ascending: true })

  if (!occasions || occasions.length === 0) return null

  const active = occasions.filter((o) => {
    if (o.recurrence === "weekly_friday") return isFriday
    if (!o.start_date || !o.end_date) return false
    return todayISO >= o.start_date && todayISO <= o.end_date
  })

  if (active.length === 0) return null

  const activeIds = active.map((o) => o.id)
  const { data: items } = await supabase
    .from("occasion_items")
    .select("occasion_id, content_id")
    .in("occasion_id", activeIds)
    .eq("content_type", contentType)
    .order("sort_order", { ascending: true })

  if (!items || items.length === 0) return null

  // Prefer the highest-priority active occasion that actually has items for this type.
  const matching = active.find((o) => items.some((i) => i.occasion_id === o.id))
  if (!matching) return null

  return {
    occasionId: matching.id,
    occasionName: matching.name,
    itemIds: items.filter((i) => i.occasion_id === matching.id).map((i) => i.content_id),
  }
}

/** Picks one id from a pool using the same day*5+slot rotation as get_daily_hadith/get_daily_verse. */
export function pickRotatingId(ids: string[], slot: number, date: Date = new Date()): string {
  const index = (getDayOfYear(date) * 5 + slot) % ids.length
  return ids[index]
}
