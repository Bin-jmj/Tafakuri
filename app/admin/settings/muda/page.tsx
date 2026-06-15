import { createClient } from "@/lib/supabase/server"
import { mapRotationSettings } from "@/lib/mappers"
import { DEFAULT_ROTATION_SETTINGS } from "@/lib/utils/rotation"
import { MudaSettingsForm } from "./muda-settings-form"

export default async function MudaSettingsPage() {
  const supabase = await createClient()
  const { data: row } = await supabase.from("rotation_settings").select("*").eq("id", 1).single()
  const settings = row ? mapRotationSettings(row) : DEFAULT_ROTATION_SETTINGS

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mipangilio ya Muda wa Kubadilisha Maudhui</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Weka saa zinazoamua ni mara ngapi kwa siku Adhkar, Aya ya Leo na Hadith ya Leo zinabadilika — bila kuhitaji
          kubadilisha msimbo (code).
        </p>
      </div>

      <MudaSettingsForm settings={settings} />
    </div>
  )
}
