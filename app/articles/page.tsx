import { ArticleCard } from "@/components/articles/article-card"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { mapArticle } from "@/lib/mappers"

export default async function ArticlesPage() {
  const supabase = await createClient()
  const { data: articleRows } = await supabase.from("articles").select("*").order("published_date", { ascending: false })
  const articles = (articleRows ?? []).map(mapArticle)

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">Makala za Kiislamu</CardTitle>
          <CardDescription className="text-base">
            Soma makala mbalimbali kuhusu Uislamu na maisha ya kila siku
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
