import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageSquare, Phone } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Wasiliana Nasi</h1>
        <p className="text-muted-foreground leading-relaxed">
          Tunafurahi kupokea maoni, mapendekezo au maswali kutoka kwako. Tumia njia zifuatazo kuwasiliana na timu ya
          Tafakuri.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start gap-3">
          <Mail className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <CardTitle className="text-base">Barua Pepe</CardTitle>
            <CardDescription>
              Tuma barua pepe yako kwa{" "}
              <a href="mailto:tafakuriapp@gmail.com" className="text-primary hover:underline">
                tafakuriapp@gmail.com
              </a>
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start gap-3">
          <Phone className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <CardTitle className="text-base">WhatsApp</CardTitle>
            <CardDescription>
              Tutumie ujumbe kupitia{" "}
              <a
                href="https://wa.me/255629575812"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                +255 629 575 812
              </a>
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start gap-3">
          <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <CardTitle className="text-base">Maoni na Marekebisho</CardTitle>
            <CardContent className="px-0 pt-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ukikuta kosa kwenye tafsiri, hadithi au maudhui mengine, tafadhali tujulishe ili tuweze kuyarekebisha
                haraka iwezekanavyo.
              </p>
            </CardContent>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
