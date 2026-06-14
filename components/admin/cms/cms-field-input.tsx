"use client"

import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { FileCheck2, ImagePlus, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CmsField } from "@/lib/cms/types"

interface CmsFieldInputProps {
  field: CmsField
  values: Record<string, unknown>
  onChange: (patch: Record<string, unknown>) => void
}

export function CmsFieldInput({ field, values, onChange }: CmsFieldInputProps) {
  const value = values[field.name]

  return (
    <div className="space-y-1.5">
      {field.type !== "boolean" && <Label htmlFor={field.name}>{field.label}</Label>}
      <FieldControl field={field} value={value} values={values} onChange={onChange} />
      {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
    </div>
  )
}

function FieldControl({ field, value, values, onChange }: { field: CmsField; value: unknown; values: Record<string, unknown>; onChange: (patch: Record<string, unknown>) => void }) {
  switch (field.type) {
    case "text":
      return (
        <Input
          id={field.name}
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange({ [field.name]: e.target.value })}
        />
      )
    case "number":
      return (
        <Input
          id={field.name}
          type="number"
          placeholder={field.placeholder}
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => onChange({ [field.name]: e.target.value === "" ? null : Number(e.target.value) })}
        />
      )
    case "date":
      return (
        <Input
          id={field.name}
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange({ [field.name]: e.target.value })}
        />
      )
    case "textarea":
      return (
        <Textarea
          id={field.name}
          rows={4}
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange({ [field.name]: e.target.value })}
        />
      )
    case "arabic":
      return (
        <Textarea
          id={field.name}
          rows={3}
          dir="rtl"
          placeholder={field.placeholder}
          className="font-arabic text-lg leading-loose"
          value={(value as string) ?? ""}
          onChange={(e) => onChange({ [field.name]: e.target.value })}
        />
      )
    case "select":
      return (
        <Select value={(value as string) ?? ""} onValueChange={(v) => onChange({ [field.name]: v })}>
          <SelectTrigger id={field.name}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case "boolean":
      return (
        <button
          type="button"
          onClick={() => onChange({ [field.name]: !value })}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 rounded-md border text-sm font-medium transition-colors",
            value ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400" : "bg-muted text-muted-foreground border-border",
          )}
        >
          {field.label}
          <span>{value ? "Ndiyo" : "Hapana"}</span>
        </button>
      )
    case "image":
      return <ImageFieldControl field={field} value={value as string | null} onChange={onChange} />
    case "drive-file":
      return <DriveFileFieldControl field={field} values={values} onChange={onChange} />
    default:
      return null
  }
}

function ImageFieldControl({ field, value, onChange }: { field: CmsField; value: string | null; onChange: (patch: Record<string, unknown>) => void }) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/storage/cover", { method: "POST", body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Imeshindikana kupakia picha")
      onChange({ [field.name]: json.url })
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Hitilafu", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-24 w-24 rounded-lg object-cover border" />
      ) : (
        <div className="h-24 w-24 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
          <ImagePlus className="h-6 w-6" />
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
            e.target.value = ""
          }}
        />
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Spinner className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
          {value ? "Badilisha Picha" : "Pakia Picha"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => onChange({ [field.name]: null })}>
            <X className="h-4 w-4" />
            Ondoa
          </Button>
        )}
      </div>
    </div>
  )
}

function DriveFileFieldControl({ field, values, onChange }: { field: CmsField; values: Record<string, unknown>; onChange: (patch: Record<string, unknown>) => void }) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const driveFileId = values.drive_file_id as string | null
  const fileSizeBytes = values.file_size_bytes as number | null

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", field.driveType ?? "book")
      const res = await fetch("/api/drive/upload", { method: "POST", body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Imeshindikana kupakia faili")
      onChange({
        drive_file_id: json.driveFileId,
        drive_mime_type: json.mimeType,
        file_size_bytes: json.sizeBytes ?? null,
      })
      toast({ title: "Faili limepakiwa kwenye Google Drive" })
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Hitilafu", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {driveFileId ? (
        <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
          <FileCheck2 className="h-4 w-4" />
          <span>Limepakiwa{fileSizeBytes ? ` (${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB)` : ""}</span>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Hakuna faili lililopakiwa</p>
      )}
      <div className="flex items-center gap-2">
        <input ref={inputRef} type="file" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ""
        }} />
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Spinner className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
          {driveFileId ? "Badilisha Faili" : "Pakia Faili"}
        </Button>
        {driveFileId && (
          <Button type="button" variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => onChange({ drive_file_id: null, drive_mime_type: null, file_size_bytes: null })}>
            <X className="h-4 w-4" />
            Ondoa
          </Button>
        )}
      </div>
    </div>
  )
}
