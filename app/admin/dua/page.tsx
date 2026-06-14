"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CmsResourcePage } from "@/components/admin/cms/cms-resource-page"
import { duasResource, adhkarResource } from "@/lib/cms/resources"

export default function DuaPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Dua &amp; Adhkar</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Simamia dua na adhkar za asubuhi na jioni</p>
      </div>
      <Tabs defaultValue="duas">
        <TabsList>
          <TabsTrigger value="duas">Dua</TabsTrigger>
          <TabsTrigger value="adhkar">Adhkar</TabsTrigger>
        </TabsList>
        <TabsContent value="duas" className="-mx-6">
          <CmsResourcePage config={duasResource} />
        </TabsContent>
        <TabsContent value="adhkar" className="-mx-6">
          <CmsResourcePage config={adhkarResource} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
