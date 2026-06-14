import { DailyHadithCard } from "@/components/hadith/daily-hadith-card"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { mapHadith } from "@/lib/mappers"

export default async function HadithPage() {
  const supabase = await createClient()
  const { data: hadithRow } = await supabase.rpc("get_daily_hadith")
  const dailyHadith = hadithRow ? mapHadith(hadithRow) : null

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">Hadith</CardTitle>
          <CardDescription className="text-base">
            Jifunze kutoka kwa mafundisho ya Mtume Muhammad (S.A.W)
          </CardDescription>
        </CardHeader>
      </Card>

      {dailyHadith && <DailyHadithCard hadith={dailyHadith} />}
    </div>
  )
}
