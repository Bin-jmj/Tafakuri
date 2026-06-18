"use client"

import { SurahList } from "@/components/quran/surah-list"
import { JuzList } from "@/components/quran/juz-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Surah } from "@/lib/types"
import { useState } from "react"

interface QuranTabsProps {
  surahs: Surah[]
}

export function QuranTabs({ surahs }: QuranTabsProps) {
  const [sortOrder, setSortOrder] = useState<"ascending" | "descending">("ascending")
  const [activeTab, setActiveTab] = useState("surah")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <TabsList className="h-11 w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
          <TabsTrigger value="surah" className="text-sm font-medium px-6">
            Sura
          </TabsTrigger>
          <TabsTrigger value="juz" className="text-sm font-medium px-6">
            Juzu
          </TabsTrigger>
        </TabsList>

        <Select value={sortOrder} onValueChange={(value: "ascending" | "descending") => setSortOrder(value)}>
          <SelectTrigger className="w-full sm:w-[200px] h-11">
            <span className="text-xs text-muted-foreground mr-1">PANGA:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ascending">KUPANDA</SelectItem>
            <SelectItem value="descending">KUSHUKA</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TabsContent value="surah" className="mt-0">
        <SurahList surahs={surahs} sortOrder={sortOrder} />
      </TabsContent>

      <TabsContent value="juz" className="mt-0">
        <JuzList surahs={surahs} sortOrder={sortOrder} />
      </TabsContent>
    </Tabs>
  )
}
