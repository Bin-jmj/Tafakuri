import { CollectionCard } from "@/components/dua/collection-card"
import { createClient } from "@/lib/supabase/server"
import { mapDua } from "@/lib/mappers"

export default async function DuaPage() {
  const supabase = await createClient()
  const { data: duaRows } = await supabase.from("duas").select("*")
  const duas = (duaRows ?? []).map(mapDua)

  const duasByCategory = duas.reduce(
    (acc, dua) => {
      if (!acc[dua.category]) {
        acc[dua.category] = []
      }
      acc[dua.category].push(dua)
      return acc
    },
    {} as Record<string, typeof duas>,
  )

  const featuredCollections = [
    {
      title: "Adhkar za Asubuhi",
      description: "Dua za kuombwa asubuhi",
      image: "/morning-adhkar.jpg",
      category: "Kuanza Jambo",
      duaCount: duasByCategory["Kuanza Jambo"]?.length || 0,
    },
    {
      title: "Adhkar za Jioni",
      description: "Dua za kuombwa jioni",
      image: "/evening-adhkar.jpg",
      category: "Shukrani",
      duaCount: duasByCategory["Shukrani"]?.length || 0,
    },
    {
      title: "Dua za Qur'ani",
      description: "Dua zilizotoka Qur'ani",
      image: "/quranic-duas.jpg",
      category: "Elimu",
      duaCount: duasByCategory["Elimu"]?.length || 0,
    },
    {
      title: "Dua za Sunnah",
      description: "Dua kutoka kwa Mtume ﷺ",
      image: "/sunnah-duas.jpg",
      category: "Faraja",
      duaCount: duasByCategory["Faraja"]?.length || 0,
    },
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">Dhikr & Du&apos;a</h1>
        <p className="text-xl text-primary font-semibold">Makusanyo Maalum</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredCollections.map((collection) => (
          <CollectionCard
            key={collection.category}
            title={collection.title}
            description={collection.description}
            image={collection.image}
            category={collection.category}
            duaCount={collection.duaCount}
          />
        ))}
      </div>
    </div>
  )
}
