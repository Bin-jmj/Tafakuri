"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CmsResourcePage } from "@/components/admin/cms/cms-resource-page"
import { mediaBooksResource, mediaAudioResource, mediaVideoResource } from "@/lib/cms/resources"

export default function VitabuPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Maktaba</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Simamia vitabu, sauti na video zilizopakiwa kwenye Google Drive</p>
      </div>
      <Tabs defaultValue="books">
        <TabsList>
          <TabsTrigger value="books">Vitabu</TabsTrigger>
          <TabsTrigger value="audio">Sauti</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
        </TabsList>
        <TabsContent value="books" className="-mx-6">
          <CmsResourcePage config={mediaBooksResource} />
        </TabsContent>
        <TabsContent value="audio" className="-mx-6">
          <CmsResourcePage config={mediaAudioResource} />
        </TabsContent>
        <TabsContent value="video" className="-mx-6">
          <CmsResourcePage config={mediaVideoResource} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
