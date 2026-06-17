import { DuaCard } from "@/components/dua/dua-card"
import { createClient } from "@/lib/supabase/server"
import { mapDua } from "@/lib/mappers"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface DuaCategoryPageProps {
  params: Promise<{ category: string }>
}

export default async function DuaCategoryPage({ params }: DuaCategoryPageProps) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)

  const supabase = await createClient()
  const { data: duaRows } = await supabase.from("duas").select("*").eq("category", decodedCategory)
  const categoryDuas = (duaRows ?? []).map(mapDua)

  if (categoryDuas.length === 0) {
    notFound()
  }

  const categoryTitles: Record<string, string> = {
    "Kila Siku": "Dua za Kila Siku",
    "Kuanza Jambo": "Dua za Kuanza Jambo",
    Shukrani: "Dua za Shukrani",
    Qurani: "Dua za Qur'ani",
    Elimu: "Dua za Elimu",
    Faraja: "Dua za Faraja",
    Afya: "Dua za Afya",
    Safari: "Dua za Safari",
    Chakula: "Dua za Chakula",
    Imani: "Dua za Imani",
    Familia: "Dua za Familia",
  }

  const displayTitle = categoryTitles[decodedCategory] || decodedCategory

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Link href="/dua">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Rudi kwenye Makusanyo
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">{displayTitle}</h1>
        <p className="text-muted-foreground mt-2">{categoryDuas.length} Dua</p>
      </div>

      <div className="space-y-6">
        {categoryDuas.map((dua) => (
          <DuaCard key={dua.id} dua={dua} showCategory={false} />
        ))}
      </div>
    </div>
  )
}
