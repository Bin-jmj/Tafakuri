import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/categories?type=hadith — returns category options for CMS dropdowns
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  const supabase = await createClient()
  let query = supabase.from("categories").select("name, sort_order")
  if (type) query = query.eq("type", type)
  query = query.order("sort_order").order("name")

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    data: (data ?? []).map((c) => ({ label: c.name, value: c.name })),
  })
}
