import { BookOpen } from "lucide-react"
import { VitabuGrid } from "@/components/vitabu/vitabu-grid"
import { createClient } from "@/lib/supabase/server"
import { mapBook } from "@/lib/mappers"

export default async function VitabuPage() {
  const supabase = await createClient()
  const { data: bookRows } = await supabase
    .from("media_items")
    .select("*")
    .eq("type", "book")
    .order("created_at", { ascending: false })
  const books = (bookRows ?? []).map(mapBook)

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Hero header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/15 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Vitabu vya Kiislamu</h1>
        </div>
        <p className="text-muted-foreground">
          Soma, pakua na shiriki vitabu vya elimu ya Kiislamu kwa Kiswahili
        </p>
      </div>

      <VitabuGrid books={books} />
    </div>
  )
}
