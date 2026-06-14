"use client"

import { useCallback, useEffect, useState } from "react"

/**
 * Client-side data hook for the generic admin CMS. Talks to
 * /api/admin/[resource] and /api/admin/[resource]/[id], which validate
 * against the resource's config in lib/cms/resources.ts.
 */
export function useCmsResource<T extends { id: string }>(resource: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => {
      if (!value) {
        if (!(key in prev)) return prev
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: value }
    })
  }, [])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      for (const [key, value] of Object.entries(filters)) params.set(key, value)
      const qs = params.toString() ? `?${params.toString()}` : ""
      const res = await fetch(`/api/admin/${resource}${qs}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Imeshindikana kupakia data")
      setData(json.data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hitilafu imetokea")
    } finally {
      setLoading(false)
    }
  }, [resource, search, filters])

  useEffect(() => {
    reload()
  }, [reload])

  const create = useCallback(
    async (values: Record<string, unknown>) => {
      const res = await fetch(`/api/admin/${resource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Imeshindikana kuhifadhi")
      await reload()
      return json.data as T
    },
    [resource, reload],
  )

  const update = useCallback(
    async (id: string, values: Record<string, unknown>) => {
      const res = await fetch(`/api/admin/${resource}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Imeshindikana kusasisha")
      await reload()
      return json.data as T
    },
    [resource, reload],
  )

  const remove = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/admin/${resource}/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? "Imeshindikana kufuta")
      }
      await reload()
    },
    [resource, reload],
  )

  return { data, loading, error, search, setSearch, filters, setFilter, create, update, remove, reload }
}
