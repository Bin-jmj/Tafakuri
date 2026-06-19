"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { X, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { OccasionContentType } from "@/lib/types"

interface PoolItem {
  itemId: string
  contentId: string
  label: string
}

interface SearchResult {
  id: string
  label: string
}

interface OccasionContentPickerProps {
  occasionId: string
  contentType: OccasionContentType
}

export function OccasionContentPicker({ occasionId, contentType }: OccasionContentPickerProps) {
  const { toast } = useToast()
  const [pool, setPool] = useState<PoolItem[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)

  async function loadPool() {
    setLoading(true)
    const res = await fetch(`/api/admin/matukio/${occasionId}/items?type=${contentType}`)
    const json = await res.json()
    setPool(json.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadPool()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occasionId, contentType])

  useEffect(() => {
    let active = true
    setSearching(true)
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/content-search?type=${contentType}&q=${encodeURIComponent(query)}`)
      const json = await res.json()
      if (active) {
        setResults(json.data ?? [])
        setSearching(false)
      }
    }, 300)
    return () => {
      active = false
      clearTimeout(t)
    }
  }, [query, contentType])

  const poolIds = new Set(pool.map((p) => p.contentId))

  async function handleAdd(id: string) {
    const res = await fetch(`/api/admin/matukio/${occasionId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_type: contentType, content_id: id }),
    })
    const json = await res.json()
    if (!res.ok) {
      toast({ title: json.error ?? "Imeshindikana", variant: "destructive" })
      return
    }
    await loadPool()
  }

  async function handleRemove(itemId: string) {
    const res = await fetch(`/api/admin/matukio/${occasionId}/items/${itemId}`, { method: "DELETE" })
    if (!res.ok) {
      toast({ title: "Imeshindikana kuondoa", variant: "destructive" })
      return
    }
    setPool((prev) => prev.filter((p) => p.itemId !== itemId))
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Maudhui yaliyochaguliwa ({pool.length})</p>
        {loading ? (
          <p className="text-sm text-muted-foreground">Inapakia...</p>
        ) : pool.length === 0 ? (
          <p className="text-sm text-muted-foreground">Hakuna maudhui yaliyochaguliwa bado. Tafuta hapa chini kuongeza.</p>
        ) : (
          <div className="space-y-1.5">
            {pool.map((item) => (
              <div key={item.itemId} className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2">
                <p className="text-sm line-clamp-1 flex-1">{item.label}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => handleRemove(item.itemId)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Tafuta kuongeza..." value={query} onValueChange={setQuery} />
          <CommandList>
            {searching ? (
              <CommandEmpty>Inatafuta...</CommandEmpty>
            ) : results.length === 0 ? (
              <CommandEmpty>{query ? "Hakuna matokeo" : "Andika ili kutafuta, au angalia orodha hapa"}</CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((r) => {
                  const added = poolIds.has(r.id)
                  return (
                    <CommandItem key={r.id} value={r.id} disabled={added} onSelect={() => handleAdd(r.id)}>
                      {added && <Check className="h-3.5 w-3.5 text-primary" />}
                      <span className="line-clamp-1">{r.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </div>
    </div>
  )
}
