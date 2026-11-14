import { BookmarksList } from "@/components/profile/bookmarks-list"
import { OfflineStorageCard } from "@/components/profile/offline-storage-card"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">Alama Zangu</CardTitle>
          <CardDescription className="text-base">Angalia na simamia alama zako zote zilizohifadhiwa</CardDescription>
        </CardHeader>
      </Card>

      <BookmarksList />

      <div className="mt-8">
        <OfflineStorageCard />
      </div>
    </div>
  )
}
