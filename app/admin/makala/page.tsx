"use client"

import { CmsResourcePage } from "@/components/admin/cms/cms-resource-page"
import { articlesResource } from "@/lib/cms/resources"

export default function MakalaPage() {
  return <CmsResourcePage config={articlesResource} />
}
