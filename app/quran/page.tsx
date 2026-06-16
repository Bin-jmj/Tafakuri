import { QuranTabs } from "@/components/quran/quran-tabs"
import { PageHeaderCard } from "@/components/ui/page-header-card"
import { BookOpen } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { mapSurah } from "@/lib/mappers"

export default async function QuranPage() {
  const supabase = await createClient()
  const { data: surahRows } = await supabase.from("surahs").select("*").order("id", { ascending: true })
  const surahs = (surahRows ?? []).map(mapSurah)

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <PageHeaderCard
        icon={BookOpen}
        title="Tafakuri ya Qur'an"
        description="Soma aya za leo zilizoangaziwa na Tafakuri"
      />

      <QuranTabs surahs={surahs} />
    </div>
  )
}
