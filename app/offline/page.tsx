import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12 text-center">
      <Image src="/logo.png" alt="Tafakuri" width={64} height={64} className="h-16 w-16 rounded-2xl mb-4" />
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <WifiOff className="h-5 w-5" />
        <span className="text-sm">Hauna mtandao</span>
      </div>
      <h1 className="text-2xl font-bold mb-2">Ukurasa huu haupatikani nje ya mtandao</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Tafadhali angalia muunganisho wako wa intaneti. Kurasa ulizotembelea hapo awali, kama Sura za
        Qur&apos;ani na Vitabu, zinaweza kuwa bado zinapatikana.
      </p>
      <Link href="/">
        <Button>Rudi Nyumbani</Button>
      </Link>
    </div>
  )
}
