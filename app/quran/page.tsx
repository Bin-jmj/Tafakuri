import { QuranTabs } from "@/components/quran/quran-tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { mapSurah } from "@/lib/mappers"

export default async function QuranPage() {
  const supabase = await createClient()
  const { data: surahRows } = await supabase.from("surahs").select("*").order("id", { ascending: true })
  const surahs = (surahRows ?? []).map(mapSurah)

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Banner */}
      <Card className="mb-6 bg-gradient-to-br from-background to-muted/20 border-primary/10 hover:border-primary/30 transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Tafakuri ya Qur&apos;an</CardTitle>
              <CardDescription className="text-base mt-1">Soma aya za leo zilizoangaziwa na Tafakuri</CardDescription>
            </div>
          </div>
          <ChevronRight className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
      </Card>

      <QuranTabs surahs={surahs} />
    </div>
  )
}
