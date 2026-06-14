import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { mapArticle, mapBook } from "@/lib/mappers"
import { ArticleDetail } from "@/components/articles/article-detail"

interface ArticlePageProps {
  params: Promise<{ id: string }>
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: articleRow } = await supabase.from("articles").select("*").eq("id", id).maybeSingle()

  if (!articleRow) {
    notFound()
  }

  const article = mapArticle(articleRow)

  const [{ data: allArticles }, { data: bookRows }] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title")
      .order("published_date", { ascending: false }),
    supabase
      .from("media_items")
      .select("*")
      .eq("type", "book")
      .eq("category", article.category)
      .order("created_at", { ascending: false })
      .limit(2),
  ])

  const list = allArticles ?? []
  const currentIndex = list.findIndex((a) => a.id === article.id)
  const prevArticle = currentIndex > 0 ? list[currentIndex - 1] : null
  const nextArticle = currentIndex >= 0 && currentIndex < list.length - 1 ? list[currentIndex + 1] : null

  const recommendedBooks = (bookRows ?? []).map(mapBook)

  return (
    <ArticleDetail
      article={article}
      prevArticle={prevArticle}
      nextArticle={nextArticle}
      recommendedBooks={recommendedBooks}
    />
  )
}
