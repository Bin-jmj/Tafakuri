import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import { createServiceClient } from "@/lib/supabase/server"
import { cmsResources } from "@/lib/cms/resources"

// GET /api/admin/[resource]?q=search — list rows for a CMS resource.
export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { resource } = await params
  const config = cmsResources[resource]
  if (!config) return NextResponse.json({ error: "Rasilimali haijulikani" }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("q")?.trim()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const pageSize = Math.max(1, Math.min(200, Number(searchParams.get("pageSize")) || config.pageSize || 20))

  const supabase = createServiceClient()
  let query = supabase.from(config.table).select("*", { count: "exact" })

  if (config.filter) {
    for (const [column, value] of Object.entries(config.filter)) {
      query = query.eq(column, value)
    }
  }

  if (search) {
    const searchableColumns = config.fields.filter((f) => f.searchable).map((f) => f.name)
    if (searchableColumns.length > 0) {
      query = query.or(searchableColumns.map((column) => `${column}.ilike.%${search}%`).join(","))
    }
  }

  for (const filter of config.extraFilters ?? []) {
    const column = filter.column ?? filter.name
    if (filter.type === "number") {
      const value = searchParams.get(filter.name)
      if (value && !Number.isNaN(Number(value))) query = query.eq(column, Number(value))
    } else {
      const min = searchParams.get(`${filter.name}_min`)
      const max = searchParams.get(`${filter.name}_max`)
      if (min && !Number.isNaN(Number(min))) query = query.gte(column, Number(min))
      if (max && !Number.isNaN(Number(max))) query = query.lte(column, Number(max))
    }
  }

  // Multi-select fields (e.g. categories) double as list filters automatically —
  // a query param matching the field name narrows to rows containing that value.
  for (const field of config.fields) {
    if (field.type === "multi-select") {
      const value = searchParams.get(field.name)
      if (value) query = query.contains(field.name, [value])
    }
  }

  query = query.order(config.orderBy.column, { ascending: config.orderBy.ascending })

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count: count ?? 0 })
}

// POST /api/admin/[resource] — create a new row.
export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { resource } = await params
  const config = cmsResources[resource]
  if (!config) return NextResponse.json({ error: "Rasilimali haijulikani" }, { status: 404 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Data si sahihi" }, { status: 400 })

  const parsed = config.schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data si sahihi" }, { status: 400 })
  }

  const supabase = createServiceClient()
  const insertData = { ...parsed.data, ...(config.filter ?? {}) }

  const { data, error } = await supabase.from(config.table).insert(insertData).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
