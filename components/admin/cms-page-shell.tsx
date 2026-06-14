"use client"

import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Download } from "lucide-react"

interface CmsPageShellProps {
  title: string
  description: string
  count: number
  searchPlaceholder?: string
  onSearch?: (q: string) => void
  onAdd: () => void
  addLabel: string
  children: ReactNode
}

export function CmsPageShell({
  title,
  description,
  count,
  searchPlaceholder = "Tafuta...",
  onSearch,
  onAdd,
  addLabel,
  children,
}: CmsPageShellProps) {
  const [query, setQuery] = useState("")

  function handleSearch(value: string) {
    setQuery(value)
    onSearch?.(value)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold">{title}</h1>
            <Badge variant="secondary" className="text-xs">{count} rekodi</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
            <Download className="h-4 w-4" />
            Hamisha
          </Button>
          <Button size="sm" className="gap-2" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 h-10 max-w-sm"
        />
      </div>

      {/* Content */}
      {children}
    </div>
  )
}
