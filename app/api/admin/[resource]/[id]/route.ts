import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import { createServiceClient } from "@/lib/supabase/server"
import { cmsResources } from "@/lib/cms/resources"

// PATCH /api/admin/[resource]/[id] — update a row.
export async function PATCH(request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { resource, id } = await params
  const config = cmsResources[resource]
  if (!config) return NextResponse.json({ error: "Rasilimali haijulikani" }, { status: 404 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Data si sahihi" }, { status: 400 })

  const parsed = config.schema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data si sahihi" }, { status: 400 })
  }

  const supabase = createServiceClient()
  let query = supabase.from(config.table).update(parsed.data as never).eq("id", id)
  if (config.filter) {
    for (const [column, value] of Object.entries(config.filter)) {
      query = query.eq(column, value)
    }
  }

  const { data, error } = await query.select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// DELETE /api/admin/[resource]/[id] — delete a row.
export async function DELETE(_request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { resource, id } = await params
  const config = cmsResources[resource]
  if (!config) return NextResponse.json({ error: "Rasilimali haijulikani" }, { status: 404 })

  const supabase = createServiceClient()
  let query = supabase.from(config.table).delete().eq("id", id)
  if (config.filter) {
    for (const [column, value] of Object.entries(config.filter)) {
      query = query.eq(column, value)
    }
  }

  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
