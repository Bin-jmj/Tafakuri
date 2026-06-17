"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, Clock, Moon } from "lucide-react"
import { formatGregorianDateSw, formatHijriDate } from "@/lib/utils/hijri"
import { useNextPrayer } from "@/hooks/use-next-prayer"

export function TodayDateCard() {
  const [now, setNow] = useState<Date | null>(null)
  const nextPrayer = useNextPrayer()

  useEffect(() => {
    setNow(new Date())
  }, [])

  return (
    <Card className="border-primary/20">
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tarehe ya Leo</p>
              <p className="font-semibold">{now ? formatGregorianDateSw(now) : " "}</p>
            </div>
          </div>
          <div className="hidden sm:block w-px bg-border" />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-accent">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Kalenda ya Kiislamu (Hijri)</p>
              <p className="font-semibold">{now ? formatHijriDate(now) : " "}</p>
            </div>
          </div>
        </div>

        {nextPrayer && (
          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sala Inayofuata</p>
                <p className="font-semibold">
                  {nextPrayer.label} &middot;{" "}
                  {nextPrayer.time.toLocaleTimeString("sw-TZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Africa/Dar_es_Salaam",
                  })}
                </p>
              </div>
            </div>
            <p className="text-sm font-medium text-primary">{nextPrayer.countdown}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
