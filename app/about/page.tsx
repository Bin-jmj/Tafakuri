import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, HandHeart, Library, Scroll } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Kuhusu Tafakuri</h1>
        <p className="text-muted-foreground leading-relaxed">
          Tafakuri ni jukwaa la maarifa ya Kiislamu kwa lugha ya Kiswahili, lililotengenezwa kwa nia ya kusaidia
          Waislamu kusoma na kutafakari Qur&apos;ani Tukufu, Hadith, Dua na Adhkar, pamoja na makala na vitabu vya
          elimu ya dini popote walipo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <BookOpen className="h-6 w-6 text-primary mb-1" />
            <CardTitle className="text-base">Qur&apos;ani na Tafsiri</CardTitle>
            <CardDescription>Soma Surah zote pamoja na tafsiri ya Kiswahili.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Scroll className="h-6 w-6 text-primary mb-1" />
            <CardTitle className="text-base">Hadith za Kila Siku</CardTitle>
            <CardDescription>Pata hadithi mpya kila siku pamoja na chanzo chake.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <HandHeart className="h-6 w-6 text-primary mb-1" />
            <CardTitle className="text-base">Dua na Adhkar</CardTitle>
            <CardDescription>Mkusanyiko wa dua na adhkar za asubuhi na jioni.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Library className="h-6 w-6 text-primary mb-1" />
            <CardTitle className="text-base">Maktaba</CardTitle>
            <CardDescription>Vitabu, sauti na video za elimu ya Kiislamu.</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Mradi Huria</h2>
        <p className="text-muted-foreground leading-relaxed">
          Tafakuri ni mradi huria (open source) unaoendelea kuboreshwa na kuongezewa maudhui kwa lengo la kunufaisha
          Umma wa Kiislamu. Tunakaribisha michango, mapendekezo na marekebisho kutoka kwa jamii.
        </p>
      </div>
    </div>
  )
}
