import { AdhkarCard } from "@/components/adhkar/adhkar-card"
import { createClient } from "@/lib/supabase/server"
import { mapAdhkar } from "@/lib/mappers"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface AdhkarCategoryPageProps {
  params: Promise<{ category: string }>
}

export default async function AdhkarCategoryPage({ params }: AdhkarCategoryPageProps) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)

  const supabase = await createClient()
  const { data: adhkarRows } = await supabase
    .from("adhkar")
    .select("*")
    .contains("categories", [decodedCategory])
    .order("sort_order", { ascending: true })
  const categoryAdhkar = (adhkarRows ?? []).map(mapAdhkar)

  if (categoryAdhkar.length === 0) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Link href="/adhkar">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Rudi kwenye Makusanyo
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">{decodedCategory}</h1>
        <p className="text-muted-foreground mt-2">{categoryAdhkar.length} Adhkar</p>
      </div>

      <div className="space-y-6">
        {categoryAdhkar.map((adhkar) => (
          <AdhkarCard key={adhkar.id} adhkar={adhkar} />
        ))}
      </div>
    </div>
  )
}
