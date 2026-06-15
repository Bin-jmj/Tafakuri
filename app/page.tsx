import Image from "next/image"
import Link from "next/link"
import { DailyHadithCard } from "@/components/hadith/daily-hadith-card"
import { DailyVerseCard } from "@/components/quran/daily-verse-card"
import { FeatureCard } from "@/components/home/feature-card"
import { AdhkarWidget } from "@/components/home/adhkar-widget"
import { TodayDateCard } from "@/components/home/today-date-card"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, HandHeart, Library, Scroll, Sparkles, ArrowRight, Newspaper } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { mapArticle, mapHadith, mapQuranVerse } from "@/lib/mappers"
import { ArticleCard } from "@/components/articles/article-card"

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: hadithRow }, { data: verseRow }, { data: articleRows }] = await Promise.all([
    supabase.rpc("get_daily_hadith"),
    supabase.rpc("get_daily_verse"),
    supabase.from("articles").select("*").order("published_date", { ascending: false }).limit(3),
  ])

  const dailyHadith = hadithRow ? mapHadith(hadithRow) : null
  const dailyVerse = verseRow ? mapQuranVerse(verseRow) : null
  const latestArticles = (articleRows ?? []).map(mapArticle)

  let dailySurahName: string | undefined
  if (dailyVerse) {
    const { data: surahRow } = await supabase
      .from("surahs")
      .select("name")
      .eq("id", dailyVerse.surahNumber)
      .single()
    dailySurahName = surahRow?.name
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-8">
      {/* Welcome banner + today's date */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-6 md:p-8 flex flex-col justify-center">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-10 h-36 w-36 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

          <div className="relative flex items-center gap-4 mb-3">
            <div className="flex h-16 w-16 md:h-20 md:w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-md ring-1 ring-primary/20 bg-primary p-2.5">
              <Image src="/logo.png" alt="Tafakuri" width={80} height={80} className="h-full w-full object-contain" priority />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Karibu Tafakuri</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1 max-w-md">
                Jifunze Qur&apos;ani, Hadith, Dua na maarifa mengine ya Kiislamu kwa Kiswahili
              </p>
            </div>
          </div>

          <div className="relative flex flex-wrap gap-3 mt-2">
            <Link href="/quran">
              <Button size="lg" className="gap-2">
                Anza Kusoma Qur&apos;ani
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/articles">
              <Button size="lg" variant="outline" className="gap-2 bg-background/60">
                <Newspaper className="h-4 w-4" />
                Soma Makala
              </Button>
            </Link>
          </div>
        </div>
        <TodayDateCard />
      </div>

      {/* Tafakuri ya Leo — daily hadith, adhkar, verse are the first interactive content */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Tafakuri ya Leo</h2>
        </div>
        <div className="space-y-6">
          <AdhkarWidget />
          <div className="grid gap-6 lg:grid-cols-2">
            {dailyVerse && <DailyVerseCard verse={dailyVerse} surahName={dailySurahName} />}
            {dailyHadith && <DailyHadithCard hadith={dailyHadith} />}
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-xl font-bold mb-4">Vifungu</h2>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <FeatureCard
            title="Qur'ani Tukufu"
            description="Soma na jifunze Qur'ani kwa Kiswahili"
            icon={BookOpen}
            href="/quran"
            gradient="bg-gradient-to-r from-primary to-primary/60"
          />
          <FeatureCard
            title="Hadith"
            description="Mafundisho ya Mtume Muhammad (S.A.W)"
            icon={Scroll}
            href="/hadith"
            gradient="bg-gradient-to-r from-accent to-accent/60"
          />
          <FeatureCard
            title="Dua na Adhkar"
            description="Dua za kila siku na adhkar"
            icon={HandHeart}
            href="/dua"
            gradient="bg-gradient-to-r from-chart-2 to-chart-2/60"
          />
          <FeatureCard
            title="Vitabu"
            description="Soma na pakua vitabu vya Kiislamu"
            icon={Library}
            href="/vitabu"
            gradient="bg-gradient-to-r from-chart-4 to-chart-4/60"
          />
          <FeatureCard
            title="Makala"
            description="Makala za Kiislamu kwa Kiswahili"
            icon={FileText}
            href="/articles"
            gradient="bg-gradient-to-r from-chart-3 to-chart-3/60"
          />
        </div>
      </div>

      {/* Latest Articles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Makala za Hivi Karibuni</h2>
          </div>
          <Link href="/articles">
            <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:text-primary">
              Zote
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {latestArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  )
}
