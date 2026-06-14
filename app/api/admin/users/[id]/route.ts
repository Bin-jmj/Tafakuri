import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import { createServiceClient } from "@/lib/supabase/server"

// PATCH /api/admin/users/[id] — update a user's role.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body || (body.role !== "admin" && body.role !== "user")) {
    return NextResponse.json({ error: "Jukumu si sahihi" }, { status: 400 })
  }

  if (id === admin.id && body.role !== "admin") {
    return NextResponse.json({ error: "Hauwezi kuondoa uongozi wako mwenyewe" }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from("profiles").update({ role: body.role }).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE /api/admin/users/[id] — remove a user account entirely.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  if (id === admin.id) {
    return NextResponse.json({ error: "Hauwezi kufuta akaunti yako mwenyewe" }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
