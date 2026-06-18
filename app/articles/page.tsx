import { ArticleCard } from "@/components/articles/article-card"
import { PageHeaderCard } from "@/components/ui/page-header-card"
import { createClient } from "@/lib/supabase/server"
import { mapArticle } from "@/lib/mappers"
import { FileText } from "lucide-react"

export default async function ArticlesPage() {
  const supabase = await createClient()
  const { data: articleRows } = await supabase.from("articles").select("*").order("published_date", { ascending: false })
  const articles = (articleRows ?? []).map(mapArticle)

  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeaderCard
        icon={FileText}
        title="Makala za Kiislamu"
        description="Soma makala mbalimbali kuhusu Uislamu na maisha ya kila siku"
      />

      {articles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">Hakuna makala zilizopatikana kwa sasa.</p>
      )}
    </div>
  )
}
