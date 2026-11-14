import { Headphones } from "lucide-react"
import { AudioGrid } from "@/components/sauti/audio-grid"
import { PageHeaderCard } from "@/components/ui/page-header-card"
import { createClient } from "@/lib/supabase/server"
import { mapAudio } from "@/lib/mappers"

export default async function SautiPage() {
  const supabase = await createClient()
  const { data: audioRows } = await supabase
    .from("media_items")
    .select("*")
    .eq("type", "audio")
    .order("created_at", { ascending: false })
  const audios = (audioRows ?? []).map(mapAudio)

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <PageHeaderCard
        icon={Headphones}
        title="Mafunzo ya Sauti"
        description="Sikiliza, pakua na shiriki mafunzo ya sauti ya Kiislamu kwa Kiswahili"
      />

      <AudioGrid audios={audios} />
    </div>
  )
}
