import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { mapOccasion } from "@/lib/mappers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { OccasionContentTabs } from "./occasion-content-tabs"

interface OccasionDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OccasionDetailPage({ params }: OccasionDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: row } = await supabase.from("occasions").select("*").eq("id", id).maybeSingle()
  if (!row) notFound()
  const occasion = mapOccasion(row)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/admin/matukio">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Rudi kwenye Matukio
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{occasion.name}</CardTitle>
          <CardDescription>
            {occasion.recurrence === "weekly_friday"
              ? "Kila Ijumaa"
              : `${occasion.startDate ?? "?"} hadi ${occasion.endDate ?? "?"}`}
            {" — "}
            {occasion.isActive ? "Inatumika" : "Imezimwa"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Chagua maudhui yatakayoonekana wakati tukio hili ni amilifu. Yanazungushwa kama kawaida — yakizidi kuwa
            mengi, yanabadilika moja baada ya nyingine.
          </p>
        </CardContent>
      </Card>

      <OccasionContentTabs occasionId={occasion.id} />
    </div>
  )
}
