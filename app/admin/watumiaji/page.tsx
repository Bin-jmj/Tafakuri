"use client"

import { useEffect, useState } from "react"
import { CmsPageShell } from "@/components/admin/cms-page-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2, ShieldCheck, ShieldOff, UserCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminUser {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  createdAt: string
  bookmarks: number
}

export default function WatumiajiPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Imeshindikana kupakia watumiaji")
      setUsers(json.data ?? [])
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Hitilafu imetokea", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  )

  async function toggleRole(user: AdminUser) {
    const nextRole = user.role === "admin" ? "user" : "admin"
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Imeshindikana kusasisha")
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)))
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Hitilafu imetokea", variant: "destructive" })
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/users/${deleteId}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Imeshindikana kufuta")
      setUsers((prev) => prev.filter((u) => u.id !== deleteId))
      toast({ title: "Mtumiaji amefutwa" })
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Hitilafu imetokea", variant: "destructive" })
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <>
      <CmsPageShell
        title="Watumiaji"
        description="Simamia watumiaji wote waliojisajili kwenye mfumo"
        count={users.length}
        searchPlaceholder="Tafuta jina, barua pepe, jukumu..."
        onSearch={setSearch}
        onAdd={() => {}}
        addLabel="Ongeza Mtumiaji"
      >
        {/* Summary row */}
        <div className="flex flex-wrap gap-3 mb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm">
            <UserCircle2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{users.length}</span>
            <span className="text-muted-foreground">Watumiaji Wote</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-medium">{users.filter((u) => u.role === "admin").length}</span>
            <span className="text-muted-foreground">Wasimamizi</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground">Hakuna watumiaji wanaolingana.</div>}
            {filtered.map((user) => (
              <Card key={user.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{user.name}</p>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                          {user.role === "admin" ? "Msimamizi" : "Mtumiaji"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Alijisajili: {new Date(user.createdAt).toLocaleDateString("sw-TZ")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Vialamisho: {user.bookmarks}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={user.role === "admin" ? "Ondoa Uongozi" : "Fanya Msimamizi"}
                        onClick={() => toggleRole(user)}
                      >
                        {user.role === "admin"
                          ? <ShieldOff className="h-3.5 w-3.5 text-muted-foreground" />
                          : <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        }
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(user.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CmsPageShell>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Futa Mtumiaji?</AlertDialogTitle>
            <AlertDialogDescription>
              Akaunti hii itafutwa kabisa pamoja na vialamisho vyake vyote. Hatua hii haiwezi kurudishwa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ghairi</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Futa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
