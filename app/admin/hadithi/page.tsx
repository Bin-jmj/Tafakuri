"use client"

import { CmsResourcePage } from "@/components/admin/cms/cms-resource-page"
import { hadithsResource } from "@/lib/cms/resources"

export default function HadithiPage() {
  return <CmsResourcePage config={hadithsResource} />
}
