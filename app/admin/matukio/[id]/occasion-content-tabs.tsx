"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OccasionContentPicker } from "@/components/admin/occasion-content-picker"

export function OccasionContentTabs({ occasionId }: { occasionId: string }) {
  return (
    <Tabs defaultValue="quran_verse">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="quran_verse">Aya</TabsTrigger>
        <TabsTrigger value="hadith">Hadith</TabsTrigger>
        <TabsTrigger value="dua">Dua</TabsTrigger>
        <TabsTrigger value="adhkar">Adhkar</TabsTrigger>
      </TabsList>
      <TabsContent value="quran_verse" className="mt-4">
        <OccasionContentPicker occasionId={occasionId} contentType="quran_verse" />
      </TabsContent>
      <TabsContent value="hadith" className="mt-4">
        <OccasionContentPicker occasionId={occasionId} contentType="hadith" />
      </TabsContent>
      <TabsContent value="dua" className="mt-4">
        <OccasionContentPicker occasionId={occasionId} contentType="dua" />
      </TabsContent>
      <TabsContent value="adhkar" className="mt-4">
        <OccasionContentPicker occasionId={occasionId} contentType="adhkar" />
      </TabsContent>
    </Tabs>
  )
}
