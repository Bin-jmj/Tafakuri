import { createClient } from "@/lib/supabase/server"
import { AdminShell } from "./admin-shell"

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "AD"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let name = "Msimamizi"
  const email = authUser?.email ?? ""

  if (authUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", authUser.id)
      .single()

    if (profile?.full_name) {
      name = profile.full_name
    }
  }

  const user = {
    name,
    email,
    initials: getInitials(name),
  }

  return <AdminShell user={user}>{children}</AdminShell>
}
