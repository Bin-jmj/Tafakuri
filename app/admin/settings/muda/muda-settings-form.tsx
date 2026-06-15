"use client"

import { useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Clock, Sun, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { RotationSettings } from "@/lib/utils/rotation"
import { updateRotationSettings } from "./actions"

// Postgres `time` columns come back as "HH:MM:SS" - <input type="time"> wants "HH:MM".
function toInputTime(value: string): string {
  return value.slice(0, 5)
}

export function MudaSettingsForm({ settings }: { settings: RotationSettings }) {
  const { toast } = useToast()
  const [isSaving, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateRotationSettings(formData)
      if (result.error) {
        toast({ title: "Imeshindikana kuhifadhi", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Mipangilio imehifadhiwa" })
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Adhkar — Asubuhi / Jioni</CardTitle>
              <CardDescription>Adhkar widget inabadilika kati ya seti mbili kwa siku</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="adhkar_asubuhi_start">Asubuhi inaanza saa</Label>
            <Input
              id="adhkar_asubuhi_start"
              name="adhkar_asubuhi_start"
              type="time"
              required
              disabled={isSaving}
              defaultValue={toInputTime(settings.adhkarAsubuhiStart)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adhkar_jioni_start">Jioni inaanza saa</Label>
            <Input
              id="adhkar_jioni_start"
              name="adhkar_jioni_start"
              type="time"
              required
              disabled={isSaving}
              defaultValue={toInputTime(settings.adhkarJioniStart)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Aya ya Leo &amp; Hadith ya Leo — Nyakati za Sala</CardTitle>
              <CardDescription>
                Aya na Hadith zinabadilika mara 5 kwa siku, mwanzo wa kila moja ukifuata wakati wa sala
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="content_fajr_start">Alfajiri inaanza saa</Label>
            <Input
              id="content_fajr_start"
              name="content_fajr_start"
              type="time"
              required
              disabled={isSaving}
              defaultValue={toInputTime(settings.contentFajrStart)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content_dhuhr_start">Adhuhuri inaanza saa</Label>
            <Input
              id="content_dhuhr_start"
              name="content_dhuhr_start"
              type="time"
              required
              disabled={isSaving}
              defaultValue={toInputTime(settings.contentDhuhrStart)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content_asr_start">Alasiri inaanza saa</Label>
            <Input
              id="content_asr_start"
              name="content_asr_start"
              type="time"
              required
              disabled={isSaving}
              defaultValue={toInputTime(settings.contentAsrStart)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content_maghrib_start">Magharibi inaanza saa</Label>
            <Input
              id="content_maghrib_start"
              name="content_maghrib_start"
              type="time"
              required
              disabled={isSaving}
              defaultValue={toInputTime(settings.contentMaghribStart)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content_isha_start">Isha inaanza saa</Label>
            <Input
              id="content_isha_start"
              name="content_isha_start"
              type="time"
              required
              disabled={isSaving}
              defaultValue={toInputTime(settings.contentIshaStart)}
            />
          </div>
        </CardContent>
      </Card>

      <div>
        <Button type="submit" className="gap-2" disabled={isSaving}>
          {isSaving && <Spinner className="h-4 w-4" />}
          Hifadhi Mipangilio
        </Button>
      </div>
    </form>
  )
}
