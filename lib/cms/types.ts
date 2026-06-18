import type { z } from "zod"
import type { Database } from "@/lib/supabase/types"

export type CmsFieldType =
  | "text"
  | "textarea"
  | "arabic"
  | "number"
  | "boolean"
  | "select"
  | "multi-select"
  | "date"
  | "image"
  | "drive-file"

export interface CmsFieldOption {
  label: string
  value: string
}

export interface CmsField {
  name: string
  label: string
  type: CmsFieldType
  placeholder?: string
  helpText?: string
  options?: CmsFieldOption[]
  /** For select fields: fetch options from /api/categories?type=<key> at runtime. */
  optionsKey?: string
  /** For type "drive-file": which Drive library folder to upload into. */
  driveType?: "book" | "audio" | "video"
  /** Shown as a column in the admin table. */
  showInTable?: boolean
  /** Included in the `q=` search across this resource. */
  searchable?: boolean
}

export interface CmsExtraFilter {
  /** Query param key (also the column name, unless `column` is set). */
  name: string
  label: string
  /** Database column to filter on (defaults to `name`). */
  column?: string
  type: "number" | "number-range"
  placeholder?: string
  min?: number
  max?: number
}

export interface CmsResourceConfig {
  /** URL-safe key, used as /api/admin/<key> and the route segment. */
  key: string
  /** Supabase table name. */
  table: keyof Database["public"]["Tables"]
  titleSingular: string
  titlePlural: string
  description: string
  addLabel: string
  searchPlaceholder?: string
  fields: CmsField[]
  /** Zod schema for create/update payloads (validated server-side). */
  schema: z.AnyZodObject
  /** Initial values for the "add new" form. */
  defaultValues: Record<string, unknown>
  orderBy: { column: string; ascending: boolean }
  /** Extra equality filters applied to every query, e.g. { type: "book" }. */
  filter?: Record<string, string | number | boolean>
  /** Field name shown as the row's main label in the table. */
  primaryColumn: string
  /** Extra filter controls shown above the table (e.g. filter by sura or aya range). */
  extraFilters?: CmsExtraFilter[]
}
