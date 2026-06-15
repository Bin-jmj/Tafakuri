import { HadithCard } from "@/components/hadith/hadith-card"
import { createClient } from "@/lib/supabase/server"
import { mapHadith } from "@/lib/mappers"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface HadithCategoryPageProps {
  params: Promise<{ category: string }>
}

export default async function HadithCategoryPage({ params }: HadithCategoryPageProps) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)

  const supabase = await createClient()
  const { data: hadithRows } = await supabase.from("hadiths").select("*").eq("category", decodedCategory)
  const categoryHadiths = (hadithRows ?? []).map(mapHadith)

  if (categoryHadiths.length === 0) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Link href="/hadith">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Rudi kwenye Makusanyo
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{decodedCategory}</h1>
        <p className="text-muted-foreground mt-2">{categoryHadiths.length} Hadithi</p>
      </div>

      <div className="space-y-6">
        {categoryHadiths.map((hadith) => (
          <HadithCard key={hadith.id} hadith={hadith} />
        ))}
      </div>
    </div>
  )
}
