"use client"

import { CmsResourcePage } from "@/components/admin/cms/cms-resource-page"
import { quranVersesResource } from "@/lib/cms/resources"

export default function QuraniPage() {
  return <CmsResourcePage config={quranVersesResource} />
}
