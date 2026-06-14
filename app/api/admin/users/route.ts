import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import { createServiceClient } from "@/lib/supabase/server"

// GET /api/admin/users — list all profiles with their auth email + bookmark count.
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const supabase = createServiceClient()

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false })

  if (profilesError) return NextResponse.json({ error: profilesError.message }, { status: 500 })

  const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  const { data: bookmarkCounts } = await supabase
    .from("bookmarks")
    .select("user_id")

  const counts = new Map<string, number>()
  for (const row of bookmarkCounts ?? []) {
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1)
  }

  const emailById = new Map(authData.users.map((u) => [u.id, u.email ?? ""]))

  const users = (profiles ?? []).map((profile) => ({
    id: profile.id,
    name: profile.full_name ?? "Hajaweka jina",
    email: emailById.get(profile.id) ?? "",
    role: profile.role,
    createdAt: profile.created_at,
    bookmarks: counts.get(profile.id) ?? 0,
  }))

  return NextResponse.json({ data: users })
}
