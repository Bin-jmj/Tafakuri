import { Library } from "lucide-react"
import { VitabuGrid } from "@/components/vitabu/vitabu-grid"
import { PageHeaderCard } from "@/components/ui/page-header-card"
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
      <PageHeaderCard
        icon={Library}
        title="Vitabu vya Kiislamu"
        description="Soma, pakua na shiriki vitabu vya elimu ya Kiislamu kwa Kiswahili"
      />

      <VitabuGrid books={books} />
    </div>
  )
}
