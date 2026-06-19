"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CmsPageShell } from "@/components/admin/cms-page-shell"
import { ContentDialog } from "@/components/admin/content-dialog"
import { CmsFieldInput } from "./cms-field-input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Pencil, Trash2, Inbox } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCmsResource } from "@/hooks/use-cms-resource"
import type { CmsField, CmsFieldOption, CmsResourceConfig } from "@/lib/cms/types"

type Row = Record<string, unknown> & { id: string }

export function CmsResourcePage({ config }: { config: CmsResourceConfig }) {
  const { toast } = useToast()
  const { data, loading, error, setSearch, filters, setFilter, create, update, remove } = useCmsResource<Row>(config.key)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Row | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>(config.defaultValues)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, CmsFieldOption[]>>({})

  useEffect(() => {
    const keys = [...new Set(config.fields.filter((f) => f.optionsKey).map((f) => f.optionsKey!))]
    if (keys.length === 0) return
    Promise.all(
      keys.map(async (key) => {
        const res = await fetch(`/api/categories?type=${key}`)
        const json = await res.json()
        return [key, (json.data ?? []) as CmsFieldOption[]] as const
      }),
    ).then((entries) => setDynamicOptions(Object.fromEntries(entries)))
  }, [config])

  function openAdd() {
    setEditing(null)
    setForm({ ...config.defaultValues })
    setDialogOpen(true)
  }

  function openEdit(row: Row) {
    setEditing(row)
    setForm({ ...config.defaultValues, ...row })
    setDialogOpen(true)
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      if (editing) {
        await update(editing.id, form)
        toast({ title: `${config.titleSingular} imesasishwa` })
      } else {
        await create(form)
        toast({ title: `${config.titleSingular} imeongezwa` })
      }
      setDialogOpen(false)
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Hitilafu imetokea", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await remove(deleteId)
      toast({ title: `${config.titleSingular} imefutwa` })
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Hitilafu imetokea", variant: "destructive" })
    } finally {
      setDeleteId(null)
    }
  }

  const tableFields = config.fields.filter((f) => f.showInTable && f.name !== config.primaryColumn)

  return (
    <>
      <CmsPageShell
        title={config.titlePlural}
        description={config.description}
        count={data.length}
        searchPlaceholder={config.searchPlaceholder}
        onSearch={setSearch}
        onAdd={openAdd}
        addLabel={config.addLabel}
      >
        {config.extraFilters && config.extraFilters.length > 0 && (
          <div className="flex flex-wrap items-end gap-3">
            {config.extraFilters.map((filter) =>
              filter.type === "number" ? (
                <div key={filter.name} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{filter.label}</label>
                  <Input
                    type="number"
                    min={filter.min}
                    max={filter.max}
                    placeholder={filter.placeholder}
                    value={filters[filter.name] ?? ""}
                    onChange={(e) => setFilter(filter.name, e.target.value)}
                    className="h-9 w-40"
                  />
                </div>
              ) : (
                <div key={filter.name} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{filter.label}</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Kutoka"
                      value={filters[`${filter.name}_min`] ?? ""}
                      onChange={(e) => setFilter(`${filter.name}_min`, e.target.value)}
                      className="h-9 w-24"
                    />
                    <span className="text-xs text-muted-foreground">hadi</span>
                    <Input
                      type="number"
                      placeholder="Mpaka"
                      value={filters[`${filter.name}_max`] ?? ""}
                      onChange={(e) => setFilter(`${filter.name}_max`, e.target.value)}
                      className="h-9 w-24"
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-6 w-6" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Inbox className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>Hakuna rekodi zilizopatikana</p>
          </div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-5 py-3 font-medium text-muted-foreground">{config.titleSingular}</th>
                      {tableFields.map((f) => (
                        <th key={f.name} className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">{f.label}</th>
                      ))}
                      <th className="text-right px-5 py-3 font-medium text-muted-foreground">Vitendo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {data.map((row) => (
                      <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-medium leading-tight line-clamp-2 max-w-md">
                            {String(row[config.primaryColumn] ?? "")}
                          </div>
                        </td>
                        {tableFields.map((f) => (
                          <td key={f.name} className="px-4 py-4 hidden sm:table-cell">
                            <CellValue field={f} row={row} dynamicOptions={dynamicOptions} onToggle={(patch) => update(row.id, patch)} />
                          </td>
                        ))}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {config.rowLink && (
                              <Link href={config.rowLink(row).href}>
                                <Button variant="outline" size="sm" className="h-8 text-xs">
                                  {config.rowLink(row).label}
                                </Button>
                              </Link>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(row.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </CmsPageShell>

      {/* Add/Edit Dialog */}
      <ContentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? `Hariri ${config.titleSingular}` : `${config.addLabel}`}
        onSave={handleSave}
        isSaving={isSaving}
      >
        {config.fields.map((field) => (
          <CmsFieldInput
            key={field.name}
            field={field}
            values={form}
            dynamicOptions={dynamicOptions}
            onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          />
        ))}
      </ContentDialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Futa {config.titleSingular}?</AlertDialogTitle>
            <AlertDialogDescription>Hatua hii haiwezi kurudishwa.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ghairi</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
              Futa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function CellValue({
  field,
  row,
  onToggle,
  dynamicOptions,
}: {
  field: CmsField
  row: Row
  onToggle: (patch: Record<string, unknown>) => void
  dynamicOptions?: Record<string, CmsFieldOption[]>
}) {
  const value = row[field.name]

  if (field.type === "boolean") {
    return (
      <button
        onClick={() => onToggle({ [field.name]: !value })}
        className={`text-xs px-2 py-1 rounded-full font-medium border transition-colors ${
          value
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400"
            : "bg-muted text-muted-foreground border-border"
        }`}
      >
        {value ? "Inapatikana" : "Haipo"}
      </button>
    )
  }

  if (field.type === "drive-file") {
    return row.drive_file_id ? (
      <Badge variant="secondary" className="text-xs">Limepakiwa</Badge>
    ) : (
      <Badge variant="outline" className="text-xs text-muted-foreground">Hamna</Badge>
    )
  }

  if (field.type === "select") {
    const opts = (field.optionsKey && dynamicOptions?.[field.optionsKey]) ? dynamicOptions[field.optionsKey] : (field.options ?? [])
    const label = opts.find((o) => o.value === value)?.label ?? String(value ?? "")
    return <Badge variant="secondary" className="text-xs">{label}</Badge>
  }

  if (field.type === "multi-select") {
    const items = Array.isArray(value) ? (value as string[]) : []
    if (items.length === 0) return <span className="text-muted-foreground">—</span>
    return (
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
        ))}
      </div>
    )
  }

  if (value === null || value === undefined || value === "") return <span className="text-muted-foreground">—</span>

  return <span className="text-muted-foreground line-clamp-1">{String(value)}</span>
}
