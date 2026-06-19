"use client"

import { useState } from "react"
import { CmsResourcePage } from "@/components/admin/cms/cms-resource-page"
import { occasionsResource } from "@/lib/cms/resources"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { findNextHijriOccurrence } from "@/lib/utils/hijri"

const DAY_MS = 24 * 3600 * 1000

const QUICK_OCCASIONS = [
  { label: "Ramadhani", hijriMonth: 9, hijriDay: 1, endHijriMonth: 10, endHijriDay: 1 },
  { label: "Idd al-Fitri", hijriMonth: 10, hijriDay: 1, durationDays: 1 },
  { label: "Idd al-Adha", hijriMonth: 12, hijriDay: 10, durationDays: 1 },
] as const

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default function MatukioPage() {
  const { toast } = useToast()
  const [creating, setCreating] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  async function quickCreate(item: (typeof QUICK_OCCASIONS)[number]) {
    setCreating(item.label)
    try {
      const start = findNextHijriOccurrence(item.hijriMonth, item.hijriDay)
      const end =
        "endHijriMonth" in item
          ? new Date(findNextHijriOccurrence(item.endHijriMonth, item.endHijriDay, 0, start).getTime() - DAY_MS)
          : new Date(start.getTime() + (item.durationDays - 1) * DAY_MS)

      const year = start.getFullYear()
      const res = await fetch("/api/admin/occasions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${item.label} ${year}`,
          recurrence: "date_range",
          start_date: toISODate(start),
          end_date: toISODate(end),
          priority: 0,
          is_active: true,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Imeshindikana kuongeza")

      toast({
        title: `${item.label} ${year} imeongezwa`,
        description: "Tarehe zimependekezwa kiotomatiki — bofya 'Hariri' kuzirekebisha, au 'Simamia Maudhui' kuongeza maudhui.",
      })
      setRefreshKey((k) => k + 1)
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Hitilafu imetokea", variant: "destructive" })
    } finally {
      setCreating(null)
    }
  }

  return (
    <div>
      <div className="px-6 pt-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Ongeza haraka (tarehe zinapendekezwa kiotomatiki):</span>
        {QUICK_OCCASIONS.map((item) => (
          <Button
            key={item.label}
            variant="outline"
            size="sm"
            disabled={creating !== null}
            onClick={() => quickCreate(item)}
          >
            {creating === item.label ? "Inaongeza..." : `+ ${item.label}`}
          </Button>
        ))}
      </div>
      <CmsResourcePage key={refreshKey} config={occasionsResource} />
    </div>
  )
}
