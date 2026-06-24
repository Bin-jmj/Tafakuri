"use client"

import { useCallback, useEffect, useState } from "react"

/**
 * Client-side data hook for the generic admin CMS. Talks to
 * /api/admin/[resource] and /api/admin/[resource]/[id], which validate
 * against the resource's config in lib/cms/resources.ts.
 */
export function useCmsResource<T extends { id: string }>(resource: string, pageSize = 20) {
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearchState] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [page, setPage] = useState(1)

  // Reset to page 1 in the same state update as the search/filter change
  // itself (React batches these), so `reload` only ever sees the new page
  // and new filters together - never an intermediate stale-page fetch.
  const setSearch = useCallback((value: string) => {
    setSearchState(value)
    setPage(1)
  }, [])

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
    setPage(1)
  }, [])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      for (const [key, value] of Object.entries(filters)) params.set(key, value)
      params.set("page", String(page))
      params.set("pageSize", String(pageSize))
      const res = await fetch(`/api/admin/${resource}?${params.toString()}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Imeshindikana kupakia data")
      const newTotal = json.count ?? 0
      setData(json.data ?? [])
      setTotal(newTotal)
      // A mutation (e.g. deleting the last row on the last page) can shrink
      // total below the current page - clamp back to the last valid page
      // instead of showing an empty table while data exists on earlier pages.
      const maxPage = Math.max(1, Math.ceil(newTotal / pageSize))
      if (page > maxPage) setPage(maxPage)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hitilafu imetokea")
    } finally {
      setLoading(false)
    }
  }, [resource, search, filters, page, pageSize])

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

  return {
    data,
    total,
    page,
    setPage,
    pageSize,
    loading,
    error,
    search,
    setSearch,
    filters,
    setFilter,
    create,
    update,
    remove,
    reload,
  }
}
