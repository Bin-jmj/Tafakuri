import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Asante kwa kujisajili!</CardTitle>
          <CardDescription>
            Tumetuma barua pepe ya uthibitisho. Tafadhali fungua barua pepe yako na ubofye kiungo
            cha uthibitisho kabla ya kuingia.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
