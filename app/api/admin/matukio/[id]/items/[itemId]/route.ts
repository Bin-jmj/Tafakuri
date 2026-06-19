import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import { createServiceClient } from "@/lib/supabase/server"

// DELETE /api/admin/matukio/[id]/items/[itemId] — remove one item from an occasion's pool.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id, itemId } = await params
  const supabase = createServiceClient()
  const { error } = await supabase.from("occasion_items").delete().eq("id", itemId).eq("occasion_id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
