import { HadithCollectionCard } from "@/components/hadith/hadith-collection-card"
import { PageHeaderCard } from "@/components/ui/page-header-card"
import { createClient } from "@/lib/supabase/server"
import { mapHadith, mapRotationSettings } from "@/lib/mappers"
import { DEFAULT_ROTATION_SETTINGS, getContentSlotIndex } from "@/lib/utils/rotation"
import { Scroll } from "lucide-react"

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Imani: "Hadithi za kuimarisha imani",
  Ibada: "Hadithi kuhusu ibada",
  Akhlaq: "Maadili na tabia njema",
  Familia: "Mahusiano ya familia",
  Elimu: "Umuhimu wa elimu",
  Sadaka: "Hisani na sadaka",
  Adabu: "Adabu na heshima",
  Afya: "Afya na usafi",
  Faraja: "Faraja na matumaini",
}

export default async function HadithPage() {
  const supabase = await createClient()

  const { data: rotationRow } = await supabase.from("rotation_settings").select("*").eq("id", 1).single()
  const rotationSettings = rotationRow ? mapRotationSettings(rotationRow) : DEFAULT_ROTATION_SETTINGS
  const contentSlot = getContentSlotIndex(rotationSettings)

  const [, { data: hadithRows }] = await Promise.all([
    supabase.rpc("get_daily_hadith", { p_slot: contentSlot }),
    supabase.from("hadiths").select("*"),
  ])

  const hadiths = (hadithRows ?? []).map(mapHadith)

  const hadithsByCategory = hadiths.reduce(
    (acc, hadith) => {
      if (!acc[hadith.category]) acc[hadith.category] = []
      acc[hadith.category].push(hadith)
      return acc
    },
    {} as Record<string, typeof hadiths>,
  )

  const collections = Object.keys(hadithsByCategory)
    .sort()
    .map((category) => ({
      category,
      title: category,
      description: CATEGORY_DESCRIPTIONS[category] ?? "Hadithi za Mtume Muhammad (S.A.W)",
      count: hadithsByCategory[category].length,
    }))

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <PageHeaderCard
        icon={Scroll}
        title="Tafakuri ya Hadith"
        description="Jifunze kutoka kwa mafundisho ya Mtume Muhammad (S.A.W)"
      />

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <HadithCollectionCard
              key={collection.category}
              title={collection.title}
              description={collection.description}
              category={collection.category}
              count={collection.count}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">Hakuna hadith zilizopatikana kwa sasa.</p>
      )}
    </div>
  )
}
