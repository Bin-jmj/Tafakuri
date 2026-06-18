import { AdhkarCollectionCard } from "@/components/adhkar/adhkar-collection-card"
import { PageHeaderCard } from "@/components/ui/page-header-card"
import { createClient } from "@/lib/supabase/server"
import { mapAdhkar } from "@/lib/mappers"
import { Sparkles } from "lucide-react"

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Asubuhi: "Adhkar za kusoma asubuhi",
  Jioni: "Adhkar za kusoma jioni",
  Sala: "Adhkar zinazohusiana na swala",
  "Baada ya Sala": "Adhkar za baada ya kumaliza swala",
  Tahajjud: "Adhkar za swala ya usiku",
  "Kabla ya Kulala": "Adhkar za kusoma kabla ya kulala",
  Kuamka: "Adhkar za baada ya kuamka usingizini",
  Safari: "Adhkar za safari",
}

export default async function AdhkarPage() {
  const supabase = await createClient()
  const { data: adhkarRows } = await supabase.from("adhkar").select("*")
  const adhkarList = (adhkarRows ?? []).map(mapAdhkar)

  const adhkarByCategory = adhkarList.reduce(
    (acc, adhkar) => {
      for (const category of adhkar.categories) {
        if (!acc[category]) acc[category] = []
        acc[category].push(adhkar)
      }
      return acc
    },
    {} as Record<string, typeof adhkarList>,
  )

  const collections = Object.keys(adhkarByCategory)
    .sort()
    .map((category) => ({
      category,
      title: category,
      description: CATEGORY_DESCRIPTIONS[category] ?? "Mkusanyiko wa adhkar",
      count: adhkarByCategory[category].length,
    }))

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <PageHeaderCard
        icon={Sparkles}
        title="Adhkar"
        description="Mkusanyiko kamili wa adhkar kwa kila wakati na hali"
      />

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <AdhkarCollectionCard
              key={collection.category}
              title={collection.title}
              description={collection.description}
              category={collection.category}
              count={collection.count}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">Hakuna adhkar zilizopatikana kwa sasa.</p>
      )}
    </div>
  )
}
