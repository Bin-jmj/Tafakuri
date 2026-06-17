import { CollectionCard } from "@/components/dua/collection-card"
import { PageHeaderCard } from "@/components/ui/page-header-card"
import { createClient } from "@/lib/supabase/server"
import { mapDua } from "@/lib/mappers"
import { HandHeart } from "lucide-react"

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Kila Siku": "Dua za matendo ya kila siku",
  "Kuanza Jambo": "Dua za kuanza shughuli mbalimbali",
  "Shukrani": "Dua za kushukuru neema za Allah",
  "Qurani": "Dua zilizotoka moja kwa moja Qur'ani Tukufu",
  "Elimu": "Dua za kutafuta elimu na busara",
  "Faraja": "Dua za wakati wa msiba na hali ngumu",
  "Afya": "Dua za afya na kinga dhidi ya magonjwa",
  "Chakula": "Dua za kabla na baada ya chakula",
  "Safari": "Dua za kusafiri na kurudi salama",
  "Imani": "Dua za kuimarisha imani",
  "Familia": "Dua za familia na watoto",
}

export default async function DuaPage() {
  const supabase = await createClient()
  const { data: duaRows } = await supabase.from("duas").select("*")
  const duas = (duaRows ?? []).map(mapDua)

  const duasByCategory = duas.reduce(
    (acc, dua) => {
      if (!acc[dua.category]) acc[dua.category] = []
      acc[dua.category].push(dua)
      return acc
    },
    {} as Record<string, typeof duas>,
  )

  const collections = Object.keys(duasByCategory)
    .sort()
    .map((category) => ({
      category,
      title: category,
      description: CATEGORY_DESCRIPTIONS[category] ?? "Dua kutoka kwa Mtume Muhammad ﷺ",
      duaCount: duasByCategory[category].length,
    }))

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <PageHeaderCard
        icon={HandHeart}
        title="Dhikr & Du'a"
        description="Makusanyo ya dua na adhkar zilizopangwa kwa ajili yako"
      />

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.category}
              title={collection.title}
              description={collection.description}
              category={collection.category}
              duaCount={collection.duaCount}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">Hakuna dua zilizopatikana kwa sasa.</p>
      )}
    </div>
  )
}
