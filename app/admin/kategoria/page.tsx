"use client"

import { CmsResourcePage } from "@/components/admin/cms/cms-resource-page"
import { categoriesResource } from "@/lib/cms/resources"

export default function KategoriaPage() {
  return <CmsResourcePage config={categoriesResource} />
}
